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

  "contact": {{
    "email": "string",
    "phone": "string",
    "linkedin": "string",
    "location": "string"
  }},

  "education": [
    {{
      "school": "string",
      "degree": "string",
      "location": "string",
      "graduation_date": "string (format as 'Month YYYY' like 'December 2026', not 'YYYY-MM')",
      "gpa": "string"
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
      "semester": "string (e.g. 'Fall 2025', 'Spring 2024', etc. Extract from resume if present)",
      "bullets": ["string", "string", ...]
    }}
  ],

  "additional_info": {{
    "computer_skills": "string",
    "certifications": ["string", "string", ...],
    "languages": ["string", "string", ...],
    "work_eligibility": "string"
  }},

  "skills": ["string", "string", ...]
}}

RULES:
- Extract ONLY information that actually appears in the resume text.
- Do NOT invent jobs, dates, companies, or skills.
- If a field is missing, set it to an empty string, empty list, or empty object as appropriate.
- "education" MUST be a list (it can have just 1 item).
- Each education entry MUST use the key "school", NOT "institution".
- If a GPA is present, put it in the "gpa" field as a short string (e.g. "3.6"). If no GPA is present, set "gpa" to an empty string.
- DATE FORMATTING: Format all dates as "Month YYYY" (e.g., "December 2026", "October 2025", "April 2021"). Do NOT use "YYYY-MM" format.
- For projects, extract semester information if present (e.g., "Fall 2025", "Spring 2024"). Look for semester indicators near project entries.
- "additional_info.certifications" MUST be a list of strings (one cert per element).
- "additional_info.languages" MUST be a list of strings (one language per element).
- Put email, phone number, LinkedIn URL, and location inside the `contact` object (do NOT repeat them as top-level fields).
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