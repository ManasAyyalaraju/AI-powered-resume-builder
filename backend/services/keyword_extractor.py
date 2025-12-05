from typing import List, Tuple
import json
from services.llm_client import client


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
1. **Must-have skills**: Critical, required skills that are explicitly stated as requirements
2. **Nice-to-have skills**: Preferred skills, "bonus" skills, or skills mentioned as advantageous
3. **Keywords**: Important industry terms, methodologies, tools, or concepts that would help with ATS matching

Extract skills from ANY domain (not just tech):
- Technical: programming languages, software, tools, frameworks
- Professional: methodologies, certifications, licenses
- Soft skills: leadership, communication, etc. (only if highly relevant)
- Industry-specific: domain knowledge, regulations, standards

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
        
        must_have = parsed.get("must_have_skills", [])
        nice_to_have = parsed.get("nice_to_have_skills", [])
        keywords = parsed.get("keywords", [])
        
        return must_have, nice_to_have, keywords
        
    except (json.JSONDecodeError, KeyError, Exception) as e:
        # Fallback: return empty lists if extraction fails
        return [], [], []
