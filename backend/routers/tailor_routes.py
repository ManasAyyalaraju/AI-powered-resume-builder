from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.pdf_resume_parser import parse_pdf_resume_to_json
from services.job_parser import parse_job_description_from_text
from services.tailor_engine import tailor_resume
from services.keyword_extractor import extract_skills_and_keywords
from services.pdf_writer import render_resume_pdf
from fastapi.responses import StreamingResponse
from openai import AuthenticationError
from core.config import settings
import re
from typing import List, Dict, Any

router = APIRouter(tags=["Tailoring"])


def _normalize_skill(skill: str) -> str:
    """Lowercase and collapse whitespace for matching."""
    return re.sub(r"\s+", " ", skill.strip().lower())


def _parse_skill_line(raw_skills: str) -> List[str]:
    """Split a pipe/comma/semicolon-separated skill line into a list."""
    if not raw_skills:
        return []
    normalized = raw_skills
    for sep in ["|", ";"]:
        normalized = normalized.replace(sep, ",")
    return [s.strip() for s in normalized.split(",") if s.strip()]


def _merge_and_dedupe_skills(*skill_lists: List[str]) -> List[str]:
    merged: List[str] = []
    seen = set()
    for skills in skill_lists:
        for skill in skills or []:
            clean = skill.strip()
            if not clean:
                continue
            key = _normalize_skill(clean)
            if key not in seen:
                seen.add(key)
                merged.append(clean)
    return merged


def _compute_compatibility(resume_skills: List[str], jd_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate compatibility using a weighted formula:
    - must-have coverage weighted 70%
    - nice-to-have coverage weighted 30%
    - cap at 60 if any must-haves are missing
    """
    must_have = jd_data.get("must_have_skills", []) or []
    nice_to_have = jd_data.get("nice_to_have_skills", []) or []

    # Build lookup maps to preserve original casing in outputs
    resume_map = {_normalize_skill(s): s for s in resume_skills}
    must_map = {_normalize_skill(s): s for s in must_have}
    nice_map = {_normalize_skill(s): s for s in nice_to_have}

    resume_norm = set(resume_map.keys())
    must_norm = list(must_map.keys())
    nice_norm = list(nice_map.keys())

    matched_must = [must_map[s] for s in must_norm if s in resume_norm]
    matched_nice = [nice_map[s] for s in nice_norm if s in resume_norm]
    missing_must = [must_map[s] for s in must_norm if s not in resume_norm]
    missing_nice = [nice_map[s] for s in nice_norm if s not in resume_norm]

    total_must = len(must_norm)
    total_nice = len(nice_norm)

    must_coverage = len(matched_must) / total_must if total_must else 0
    nice_coverage = len(matched_nice) / total_nice if total_nice else 0

    if total_must == 0:
        raw_score = 100 * nice_coverage
    elif total_nice == 0:
        # When no nice-to-haves exist, score purely on must-have coverage
        raw_score = 100 * must_coverage
        if missing_must:
            raw_score = min(raw_score, 80)
    else:
        raw_score = 100 * (0.7 * must_coverage + 0.3 * nice_coverage)
        if missing_must:
            raw_score = min(raw_score, 80)

    score = max(0, min(100, round(raw_score)))

    resume_skill_hits = [resume_map[s] for s in resume_norm if s in set(must_norm + nice_norm)]

    return {
        "score": score,
        "must_coverage": must_coverage,
        "nice_coverage": nice_coverage,
        "matched_must_have": matched_must,
        "matched_nice_to_have": matched_nice,
        "missing_must_have": missing_must,
        "missing_nice_to_have": missing_nice,
        "resume_skill_hits": resume_skill_hits,
    }

@router.post("/tailor/pdf")
async def tailor_resume_from_pdf(
    pdf: UploadFile = File(...),
    jd_text: str = Form(...),
    output: str = Form("json"),
):
    """
    Upload:
    - Resume PDF
    - JD text
    Returns:
    - Tailored resume JSON
    """
    
    # Validate API key before processing
    try:
        settings.validate_api_key()
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    # Save PDF to /tmp
    temp_path = f"/tmp/{pdf.filename}"
    with open(temp_path, "wb") as f:
        f.write(await pdf.read())

    try:
        # 1) PDF -> Resume Object
        resume = parse_pdf_resume_to_json(temp_path)

        # Parse any dedicated skills line and MERGE with extracted skills (do not overwrite).
        line_skills: List[str] = []
        if getattr(resume.additional_info, "computer_skills", None):
            line_skills = _parse_skill_line(resume.additional_info.computer_skills)
        elif getattr(resume.additional_info, "technical_skills", None):
            line_skills = _parse_skill_line(resume.additional_info.technical_skills)

        resume.skills = _merge_and_dedupe_skills(resume.skills or [], line_skills)

        # 2) JD text -> JobDescription
        jd = parse_job_description_from_text(jd_text)

        # 2b) Extract skills from JD and add to resume if they appear in the resume text
        # This helps identify skills that were mentioned in experience but not explicitly listed.
        # We only add skills that are both in the JD requirements AND can be found in the resume content.
        if not resume.skills or len(resume.skills) == 0:
            # If no skills were extracted, try to extract from the full resume text
            # This is a fallback - ideally skills should be extracted during PDF parsing
            pass
        
        # Note: We no longer automatically add JD skills to the resume.
        # Skills should be extracted from the resume itself during parsing.
        # The JD skills are used for tailoring/emphasis, not for adding new skills.

        # 3) Tailor
        tailored_resume = tailor_resume(resume, jd)

        # 3b) Compatibility report
        jd_data = jd.model_dump()
        compatibility = _compute_compatibility(tailored_resume.skills or [], jd_data)

        # 4) Output mode
        if output.lower() == "pdf":
            pdf_bytes = render_resume_pdf(tailored_resume)
            return StreamingResponse(
                iter([pdf_bytes]),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": 'attachment; filename="tailored_resume.pdf"'
                },
            )

        return {
            "resume": tailored_resume,
            "job_description": jd,
            "compatibility": compatibility,
        }
    except AuthenticationError as e:
        raise HTTPException(
            status_code=401,
            detail=f"OpenAI API authentication failed. Please check your API key in the .env file.\n"
                   f"Error: {str(e)}\n"
                   f"Get your API key from: https://platform.openai.com/account/api-keys"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing your request: {str(e)}"
        )