from models.resume_models import Resume
from models.job_models import JobDescription
from .llm_client import rewrite_resume_sections
import json
import re


def estimate_resume_fullness(resume: Resume) -> int:
    """
    Estimate how full/dense the resume content is by counting various elements.
    Returns a score representing content density.
    
    Higher scores indicate fuller resumes that may not have room for headline/summary.
    """
    score = 0
    
    # Count experience entries and bullets (weighted heavily)
    if resume.experience:
        score += len(resume.experience) * 3  # Each experience entry counts as 3
        for exp in resume.experience:
            score += len(exp.bullets)  # Each bullet counts as 1
    
    # Count project entries and bullets
    if resume.projects:
        score += len(resume.projects) * 2  # Each project counts as 2
        for proj in resume.projects:
            score += len(proj.bullets)
    
    # Count education entries
    if resume.education:
        score += len(resume.education) * 2  # Each education entry counts as 2
    
    # Count other sections (lighter weight)
    if resume.volunteer_work:
        score += len(resume.volunteer_work) * 2
        for vol in resume.volunteer_work:
            score += len(vol.bullets)
    
    if resume.awards:
        score += len(resume.awards)
    
    if resume.publications:
        score += len(resume.publications) * 2
    
    # Skills section counts as 1
    if resume.skills:
        score += 1
    
    return score


def conditionally_remove_headline_summary(resume: Resume) -> Resume:
    """
    Remove headline and summary sections if the resume is too full to fit on one page.
    
    Threshold guideline:
    - Score < 30: Resume has room for headline/summary
    - Score >= 30: Resume is full, remove headline/summary to stay within 1 page
    """
    FULLNESS_THRESHOLD = 30
    
    fullness_score = estimate_resume_fullness(resume)
    
    if fullness_score >= FULLNESS_THRESHOLD:
        # Resume is too full - remove headline and summary
        resume.headline = None
        resume.summary = None
    
    # Otherwise, keep headline and summary as is
    return resume


def format_skill(skill: str) -> str:
    """
    Format a skill string:
    - If it's a tool (no commas or "and"), keep it as is
    - If it's a concept phrase (contains commas or "and"), capitalize first letter of every word
    """
    # Check if it's a concept phrase (contains commas or " and " with spaces)
    if "," in skill or re.search(r'\s+and\s+', skill, re.IGNORECASE):
        # Title case: capitalize first letter of every word
        # Split by word boundaries to handle punctuation properly
        def capitalize_word(word: str) -> str:
            """Capitalize first letter of a word, lowercasing the rest."""
            if not word:
                return word
            # Find first alphabetic character
            for i, char in enumerate(word):
                if char.isalpha():
                    return word[:i] + char.upper() + word[i+1:].lower()
            return word
        
        # Split into words (preserving spaces)
        words = skill.split()
        formatted_words = [capitalize_word(word) for word in words]
        return " ".join(formatted_words)
    else:
        # Keep tools as is
        return skill


def format_skills_list(skills: list[str]) -> list[str]:
    """Format a list of skills according to the formatting rules."""
    return [format_skill(skill) for skill in skills]


def reorder_skills(resume: Resume, jd: JobDescription) -> Resume:
    jd_skills = set(jd.must_have_skills + jd.nice_to_have_skills)
    jd_skills_lower = {s.lower() for s in jd_skills}

    matching = [s for s in resume.skills if s.lower() in jd_skills_lower]
    non_matching = [s for s in resume.skills if s.lower() not in jd_skills_lower]

    resume.skills = matching + non_matching
    return resume


def tailor_resume(resume: Resume, jd: JobDescription) -> Resume:
    """
    Tailor resume to the job description:
    1. Reorder skills to prioritize JD-relevant ones.
    2. Ask LLM to rewrite summary + bullets.
    3. Enforce:
       - company, title, dates, location stay EXACTLY the same
       - number of bullets per experience/project stays the same
    """
    # Keep original experience & project structures for safety
    original_experience = [exp.model_copy(deep=True) for exp in resume.experience]
    original_projects = [proj.model_copy(deep=True) for proj in resume.projects]

    # Step 1: rule-based skills adjustment
    resume = reorder_skills(resume, jd)

    # Step 2: LLM rewrite
    resume_json = json.loads(resume.model_dump_json())
    jd_json = json.loads(jd.model_dump_json())

    rewritten_json_str = rewrite_resume_sections(resume_json, jd_json)

    try:
        rewritten_data = json.loads(rewritten_json_str)
    except json.JSONDecodeError:
        # Fallback to rule-based resume if model breaks JSON
        return resume

    rewritten_resume = Resume.model_validate(rewritten_data)

    # Step 3a: lock experience metadata and bullet counts
    locked_experience = []
    for original, rewritten in zip(original_experience, rewritten_resume.experience):
        # Lock non-editable fields
        rewritten.company = original.company
        rewritten.title = original.title
        rewritten.start_date = original.start_date
        rewritten.end_date = original.end_date
        rewritten.location = original.location

        # Enforce same number of bullets
        orig_bullets = original.bullets
        new_bullets = rewritten.bullets or []

        if len(new_bullets) < len(orig_bullets):
            # If fewer bullets returned, pad with original ones
            new_bullets = new_bullets + orig_bullets[len(new_bullets):]
        elif len(new_bullets) > len(orig_bullets):
            # If too many, truncate
            new_bullets = new_bullets[: len(orig_bullets)]

        rewritten.bullets = new_bullets
        locked_experience.append(rewritten)

    rewritten_resume.experience = locked_experience

    # Step 3b: enforce same bullet count for projects too
    locked_projects = []
    for original, rewritten in zip(original_projects, rewritten_resume.projects):
        orig_bullets = original.bullets
        new_bullets = rewritten.bullets or []

        if len(new_bullets) < len(orig_bullets):
            new_bullets = new_bullets + orig_bullets[len(new_bullets):]
        elif len(new_bullets) > len(orig_bullets):
            new_bullets = new_bullets[: len(orig_bullets)]

        rewritten.bullets = new_bullets
        locked_projects.append(rewritten)

    rewritten_resume.projects = locked_projects

    # Step 4: Format skills (tools stay as is, concept phrases get title case)
    rewritten_resume.skills = format_skills_list(rewritten_resume.skills)

    # Step 5: Conditionally remove headline/summary if resume is too full
    rewritten_resume = conditionally_remove_headline_summary(rewritten_resume)

    return rewritten_resume
