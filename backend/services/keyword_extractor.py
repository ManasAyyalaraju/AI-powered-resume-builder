from typing import List, Tuple
import json
import re
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


def extract_skills_and_keywords(text: str) -> Tuple[List[str], List[str], List[str]]:
    """
    Use LLM to dynamically extract skills and keywords from job description text.
    Works for any domain (tech, healthcare, finance, marketing, etc.)
    
    Returns:
    - must_have_skills: Critical/required skills mentioned in the JD
    - nice_to_have_skills: Preferred but not required skills
    - keywords: Important keywords/phrases for ATS matching
    """
    
    prompt = f"""
You are a job description analyzer. Extract skills and keywords from the following job description.

Analyze the text and identify:
1. **Must-have skills**: Concrete tools, software, platforms, certifications, or specific methodologies that are explicitly required
2. **Nice-to-have skills**: Concrete skills that are preferred, "bonus", or advantageous
3. **Keywords**: Important industry terms, methodologies, tools, or concepts that would help with ATS matching

Extract skills from ANY domain (not just tech) but ONLY include actual skills (software/tools/methodologies/certifications). Do NOT include general requirements:
- EXCLUDE education/degree requirements, years of experience, tenure, ability to work, self-starter traits, motivation, organization, customer service, vendor interaction, or strong communication statements. These can be keywords but not skills.
- Soft skills should only be included if they are specific practices (e.g., "Agile communication frameworks") rather than generic traits.

Return a JSON object with this structure:
{{
  "must_have_skills": ["skill1", "skill2", ...],
  "nice_to_have_skills": ["skill1", "skill2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}}

Rules:
- Extract ONLY skills/keywords that actually appear in the text
- Be specific (e.g., "Python" not just "programming")
- Include variations (e.g., "SQL" and "PostgreSQL" if both mentioned)
- For must-have vs nice-to-have: Look for language like "required", "must have", "essential" vs "preferred", "nice to have", "bonus"
- Do NOT label education, years-of-experience, personality traits, or general ability statements as skills.
- Keywords should include important domain terms, methodologies, or concepts
- Return ONLY valid JSON. No markdown, no explanations.

JOB DESCRIPTION TEXT:
\"\"\"{text}\"\"\"
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )

        raw_content = response.choices[0].message.content.strip()
        
        # Handle possible markdown code blocks
        if raw_content.startswith("```"):
            first_newline = raw_content.find("\n")
            last_fence = raw_content.rfind("```")
            if first_newline != -1 and last_fence != -1:
                raw_content = raw_content[first_newline + 1:last_fence].strip()

        parsed = json.loads(raw_content)
        
        must_have = _filter_concrete_skills(parsed.get("must_have_skills", []))
        nice_to_have = _filter_concrete_skills(parsed.get("nice_to_have_skills", []))
        keywords = parsed.get("keywords", [])
        
        return must_have, nice_to_have, keywords
        
    except (json.JSONDecodeError, KeyError, Exception) as e:
        # Fallback: return empty lists if extraction fails
        return [], [], []
