import json
from models.job_models import JobDescription
from services.llm_client import client


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
  "must_have_skills": ["string", "string", ...],  // required/critical skills
  "nice_to_have_skills": ["string", "string", ...],  // preferred but not required skills
  "keywords": ["string", "string", ...],  // important keywords for ATS matching
  "responsibilities": ["string", "string", ...]  // key responsibilities (optional)
}}

Rules:
- Extract ONLY what appears in the text.
- If a field is missing, use an empty string "" or empty list [].
- "must_have_skills": Skills explicitly stated as required, essential, or mandatory
- "nice_to_have_skills": Skills mentioned as preferred, bonus, or advantageous
- "keywords": Important industry terms, methodologies, or concepts for ATS matching
- Extract skills from ANY domain (tech, healthcare, finance, marketing, etc.)
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

    # Validate against the JobDescription model
    jd_obj = JobDescription.model_validate(parsed)
    return jd_obj