import json
import re
from datetime import datetime
from services.pdf_reader import extract_text_from_pdf
from models.resume_models import Resume
from services.llm_client import client


def format_date(date_str: str) -> str:
    """
    Convert date from YYYY-MM format to "Month YYYY" format.
    If already in readable format, return as-is.
    Examples:
    - "2026-12" -> "December 2026"
    - "2021-04" -> "April 2021"
    - "December 2026" -> "December 2026" (unchanged)
    """
    if not date_str or date_str == "Present":
        return date_str
    
    # Check if already in readable format (contains month name)
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    if any(month in date_str for month in month_names):
        return date_str
    
    # Try to parse YYYY-MM format
    match = re.match(r'(\d{4})-(\d{2})', date_str)
    if match:
        year = int(match.group(1))
        month = int(match.group(2))
        try:
            date_obj = datetime(year, month, 1)
            return date_obj.strftime("%B %Y")
        except ValueError:
            return date_str
    
    return date_str


def parse_pdf_resume_to_json(file_path: str) -> Resume:
    """
    1) Extract raw text from the PDF
    2) Ask the LLM to convert it into the Resume JSON structure
    3) Validate that JSON against the Resume Pydantic model
    """

    raw_text = extract_text_from_pdf(file_path)

    prompt = f"""
You are a resume parser.

I will give you RAW TEXT extracted from a PDF resume.
Convert it into a JSON object matching this structure (keys and types).
Make sure the field NAMES and TYPES are EXACTLY as specified:

{{
  "name": "string",
  "headline": "string (optional - professional headline/title if present)",
  "summary": "string (optional - professional summary/objective if present)",

  "contact": {{
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "location": "string"
  }},

  "education": [
    {{
      "school": "string",
      "degree": "string (e.g., 'Bachelor of Science', 'Master of Arts')",
      "major": "string (e.g., 'Computer Science', 'Business Administration') - REQUIRED if degree is present",
      "location": "string",
      "graduation_date": "string (format as 'Month YYYY' like 'December 2026', not 'YYYY-MM')",
      "gpa": "string",
      "scholarships": "string (extract any scholarships, honors, or awards mentioned in the education section as a comma-separated string)"
    }}
  ],

  "experience": [
    {{
      "title": "string",
      "company": "string",
      "location": "string",
      "start_date": "string (format as 'Month YYYY' like 'October 2025', or 'YYYY-MM' if month unclear)",
      "end_date": "string (format as 'Month YYYY' like 'July 2021', or 'Present' for current roles)",
      "bullets": ["string", "string", ...]
    }}
  ],

  "projects": [
    {{
      "name": "string",
      "role": "string",
      "semester": "string (e.g. 'Fall 2025', 'Spring 2024', 'September 2025', 'Month YYYY' format. Extract ANY date or semester information from the project entry and put it here, NOT in the role field)",
      "bullets": ["string", "string", ...]
    }}
  ],

  "leadership": [
    {{
      "organization": "string",
      "role": "string",
      "location": "string",
      "start_date": "string (format as 'Month YYYY')",
      "end_date": "string (format as 'Month YYYY' or 'Present')",
      "bullets": ["string", "string", ...]
    }}
  ],

  "volunteer_work": [
    {{
      "organization": "string",
      "role": "string",
      "location": "string",
      "start_date": "string (format as 'Month YYYY')",
      "end_date": "string (format as 'Month YYYY' or 'Present')",
      "bullets": ["string", "string", ...]
    }}
  ],

  "awards": [
    {{
      "title": "string",
      "organization": "string",
      "date": "string (format as 'Month YYYY' or 'YYYY')",
      "description": "string"
    }}
  ],

  "publications": [
    {{
      "title": "string",
      "authors": "string",
      "venue": "string (journal, conference, etc.)",
      "date": "string (format as 'Month YYYY' or 'YYYY')",
      "url": "string"
    }}
  ],

  "additional_info": {{
    "computer_skills": "string (for technical/IT roles - extract skills section if labeled as 'Computer Skills', 'Technical Skills', etc.)",
    "technical_skills": "string (alternative to computer_skills for non-tech roles - any technical competencies)",
    "certifications": ["string", "string", ...],
    "languages": ["string", "string", ...],
    "work_eligibility": "string",
    "professional_memberships": ["string", "string", ...],
    "other": "string (any other additional information that doesn't fit above categories)"
  }},

  "skills": ["string", "string", ...]
}}

RULES:
- Extract ONLY information that actually appears in the resume text.
- Do NOT invent jobs, dates, companies, or skills.
- If a field is missing, set it to an empty string, empty list, or empty object as appropriate.
- **NAME EXTRACTION**: The "name" field should be extracted from the very top of the resume, typically the largest text at the beginning. Extract the COMPLETE full name EXACTLY as it appears, including ALL letters. Do NOT truncate or skip any characters. If the name appears incomplete or garbled in the text extraction, check the email address for clues (e.g., if email is "Aswath.Manu@utdallas.edu", the name is likely "Aswath Manu" not "Swath Manu"). Examples of CORRECT extraction: "Aswath Manu", "John Smith", "Maria Garcia-Lopez".
- "education" MUST be a list (it can have just 1 item, or empty list if no education section).
- Each education entry MUST use the key "school", NOT "institution".
- **EDUCATION PARSING**: Separate degree and major into two fields:
  * "degree": The degree type (e.g., "Bachelor of Science", "Master of Arts", "PhD")
  * "major": The field of study/major (e.g., "Computer Science", "Business Administration", "Biology")
  * If the resume shows "Bachelor of Science in Computer Science" or "B.S., Computer Science", split it into degree="Bachelor of Science" and major="Computer Science"
- If a GPA is present, put it in the "gpa" field as a short string (e.g. "3.6"). If no GPA is present, set "gpa" to an empty string.
- DATE FORMATTING: Format all dates as "Month YYYY" (e.g., "December 2026", "October 2025", "April 2021"). Do NOT use "YYYY-MM" format. If only year is available, use just "YYYY".
- **PROJECTS SECTION**: The "projects" field should include content from sections labeled as:
  * "PROJECTS" or "Projects"
  * "EXTRACURRICULAR ACTIVITIES" or "Extracurricular Activities"
  * Any similar section that describes projects, activities, or initiatives (not work experience)
  * If the resume has "EXTRACURRICULAR ACTIVITIES" instead of "PROJECTS", map that content to the "projects" field
- "projects" is OPTIONAL - only include if the resume has a projects or extracurricular activities section. If no projects, use empty list [].
- **PROJECT DATE/SEMESTER EXTRACTION**: For projects, extract ANY date or semester information (e.g., "Fall 2025", "Spring 2024", "September 2025", "December 2023", etc.) and put it in the "semester" field. Dates can be in "Month YYYY" format (like "September 2025") or semester format (like "Fall 2025"). 
- **CRITICAL**: Do NOT include dates or semesters in the "role" field. The "role" field should only contain the role/title (e.g., "Officer/Education Lead"), and the date/semester should ALWAYS go in the "semester" field. If a project entry shows "Organization Name – Role – Date", extract the date separately into the "semester" field, not as part of the role.
- **LEADERSHIP SECTION**: The "leadership" field should include content from sections labeled as:
  * "LEADERSHIP" or "Leadership"
  * "LEADERSHIP EXPERIENCE" or "Leadership Experience"
  * "LEADERSHIP EXPERIENCE AND ACTIVITIES" or "Leadership Experience and Activities"
  * "LEADERSHIP ACTIVITIES" or similar variations
  * Any section that describes leadership roles in organizations, clubs, or groups
  * Examples: President of a club, Founder of an organization, Officer positions, Committee leadership, etc.
- "leadership" is OPTIONAL - only include if the resume has a dedicated leadership section. If no leadership section, use empty list [].
- **LEADERSHIP vs VOLUNTEER WORK**: Distinguish between leadership roles and volunteer work:
  * LEADERSHIP: Roles with titles like President, Founder, Officer, Director, Chair, Lead, etc. in organizations/clubs
  * VOLUNTEER WORK: Actual volunteer service activities (food banks, community service, tutoring, charity work)
  * If a position has both leadership and volunteer aspects, classify as "leadership" if it emphasizes a leadership role
- **VOLUNTEER WORK CLASSIFICATION**: Only classify entries as "volunteer_work" if they are actual volunteer activities (e.g., volunteering at a food bank, community service, charity work). Do NOT classify the following as volunteer work:
  * Professional organizations or associations (e.g., "Financial Leadership Association", "IEEE", "ACM")
  * Student clubs or academic organizations (unless explicitly described as volunteer work)
  * Professional memberships - these should go in "additional_info.professional_memberships" instead
  * Extracurricular activities that are not explicitly volunteer work - these should go in "projects" instead
- "volunteer_work", "awards", "publications", and "leadership" are OPTIONAL - only include if present in the resume. Use empty lists [] if not present.
- SKILLS EXTRACTION: Extract ALL skills, tools, technologies, and competencies mentioned anywhere in the resume:
  * From dedicated skills sections (e.g., "Skills", "Technical Skills", "Computer Skills", "Core Competencies")
  * From experience bullet points (e.g., "Used Python and SQL to...")
  * From project descriptions
  * From education coursework
  * Include: programming languages, software, frameworks, methodologies, tools, platforms, etc.
  * Put all extracted skills in the top-level "skills" array.
- "additional_info.computer_skills" or "additional_info.technical_skills": If there's a dedicated skills section in the resume, extract the raw text here (as a single string, preserving separators like commas, pipes, etc.). This is separate from the structured "skills" array.
- "additional_info.certifications" MUST be a list of strings (one cert per element).
- "additional_info.languages" MUST be a list of strings (one language per element).
- "additional_info.professional_memberships" MUST be a list of strings (e.g., ["IEEE", "ACM", "American Medical Association"]).
- Put email, phone number, LinkedIn URL, and location inside the `contact` object (do NOT repeat them as top-level fields).
- Extract "headline" if there's a professional title/headline below the name.
- Extract "summary" if there's a professional summary, objective, or profile section.
- Return ONLY valid JSON. No comments, no markdown, no explanations.

RAW RESUME TEXT:
\"\"\"{raw_text}\"\"\"
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    raw_content = response.choices[0].message.content.strip()

    # 1) Ensure we got valid JSON
    try:
        parsed = json.loads(raw_content)
    except json.JSONDecodeError as e:
        raise ValueError(
            "LLM did not return valid JSON. First 500 chars:\n"
            + raw_content[:500]
        ) from e

    # 2) Validate against the Resume model
    resume_obj = Resume.model_validate(parsed)
    
    # 3) Format dates to readable format (Month YYYY)
    # Format education dates
    for edu in resume_obj.education:
        if edu.graduation_date:
            edu.graduation_date = format_date(edu.graduation_date)
    
    # Format experience dates
    for exp in resume_obj.experience:
        if exp.start_date:
            exp.start_date = format_date(exp.start_date)
        if exp.end_date and exp.end_date != "Present":
            exp.end_date = format_date(exp.end_date)
    
    return resume_obj