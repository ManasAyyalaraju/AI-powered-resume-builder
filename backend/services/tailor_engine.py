from models.resume_models import Resume
from models.job_models import JobDescription
from .llm_client import rewrite_resume_sections
import json


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

    return rewritten_resume
