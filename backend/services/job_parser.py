import json
import re
from typing import List
from models.job_models import JobDescription
from services.llm_client import client


NON_SKILL_PATTERNS = [
    r"\b\d+\s*(\+)?\s*(years|year|yrs)\b",
    r"\bexperience\b",
    r"\bdegree\b",
    r"\bbachelor",
    r"\bmaster",
    r"\bph\.?d",
    r"\bself[-\s]?starter\b",
    r"\bmotivated\b",
    r"\bability to\b",
    r"\bstrong\b",
    r"\bcustomer service\b",
    r"\bcommunication\b",
    r"\binteract with vendors\b",
    r"\borganized\b",
]


def _filter_concrete_skills(skills: List[str]) -> List[str]:
    filtered: List[str] = []
    seen = set()

    for skill in skills:
        cleaned = skill.strip()
        if not cleaned:
            continue

        lowered = cleaned.lower()
        if any(re.search(pattern, lowered, re.IGNORECASE) for pattern in NON_SKILL_PATTERNS):
            continue

        if lowered not in seen:
            filtered.append(cleaned)
            seen.add(lowered)

    return filtered


def parse_job_description_from_text(text: str) -> JobDescription:
    """
    Use the LLM to convert raw JD text into a structured JobDescription object.
    """

    prompt = f"""
You are a job description parser.

Convert the following job description text into a JSON object with this structure:

{{
  "title": "string",            // job title
  "company": "string",          // company name if present, else ""
  "location": "string",         // location if present, else ""
  "employment_type": "string",  // e.g. Internship, Full-time, etc. or ""
  "raw_text": "string",         // full original JD text
  "must_have_skills": ["string", "string", ...],  // required/critical skills (concrete tools, software, certifications, or methodologies only)
  "nice_to_have_skills": ["string", "string", ...],  // preferred but not required skills (concrete only)
  "keywords": ["string", "string", ...],  // important keywords for ATS matching
  "responsibilities": ["string", "string", ...]  // key responsibilities (optional)
}}

Rules:
- Extract ONLY what appears in the text.
- If a field is missing, use an empty string "" or empty list [].
- "must_have_skills": Concrete tools/software/platforms/certifications/methodologies explicitly stated as required.
- "nice_to_have_skills": Same kind of concrete skills that are preferred/bonus.
- Do NOT classify education requirements, years of experience, tenure, personality traits (self-starter, motivated, organized), or generic ability/communication/customer-service/vendor interaction statements as skills. Those may remain as keywords/responsibilities if present.
- "keywords": Important industry terms, methodologies, or concepts for ATS matching.
- Extract skills from ANY domain (tech, healthcare, finance, marketing, etc.) but keep them concrete.
- Return ONLY valid JSON. Do NOT wrap it in markdown or backticks.

JOB DESCRIPTION TEXT:
\"\"\"{text}\"\"\"
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    raw = response.choices[0].message.content.strip()

    # --- Handle possible ```json ... ``` style wrapping ---
    if raw.startswith("```"):
        # remove leading/trailing code fences
        # e.g. ```json\n{...}\n``` -> {...}
        first_newline = raw.find("\n")
        last_fence = raw.rfind("```")
        if first_newline != -1 and last_fence != -1:
            raw = raw[first_newline + 1:last_fence].strip()

    # Parse JSON manually so we can see good errors if it fails
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(
            "JD parser: LLM did not return valid JSON. First 500 chars:\n"
            + raw[:500]
        ) from e

    parsed["must_have_skills"] = _filter_concrete_skills(parsed.get("must_have_skills", []))
    parsed["nice_to_have_skills"] = _filter_concrete_skills(parsed.get("nice_to_have_skills", []))

    # Validate against the JobDescription model
    jd_obj = JobDescription.model_validate(parsed)
    return jd_obj