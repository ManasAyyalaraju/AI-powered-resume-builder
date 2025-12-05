from fastapi import APIRouter, UploadFile, File, Form
from services.pdf_resume_parser import parse_pdf_resume_to_json
from services.job_parser import parse_job_description_from_text
from services.tailor_engine import tailor_resume
from services.keyword_extractor import extract_skills_and_keywords
from services.pdf_writer import render_resume_pdf
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["Tailoring"])

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

    # Save PDF to /tmp
    temp_path = f"/tmp/{pdf.filename}"
    with open(temp_path, "wb") as f:
        f.write(await pdf.read())

    # 1) PDF -> Resume Object
    resume = parse_pdf_resume_to_json(temp_path)

    # Normalize skills from the "Computer Skills" or "Technical Skills" line if present.
    # The PDF often has a single pipe- or comma-separated string like
    # "Python | SQL | PostgreSQL | Tableau | Power BI | Jira".
    if getattr(resume.additional_info, "computer_skills", None):
        raw_skills = resume.additional_info.computer_skills
        # Treat '|', ';', and ',' as separators and normalize to commas first.
        for sep in ["|", ";"]:
            raw_skills = raw_skills.replace(sep, ",")
        parsed_skills = [s.strip() for s in raw_skills.split(",") if s.strip()]
        if parsed_skills:
            resume.skills = parsed_skills
    elif getattr(resume.additional_info, "technical_skills", None):
        raw_skills = resume.additional_info.technical_skills
        for sep in ["|", ";"]:
            raw_skills = raw_skills.replace(sep, ",")
        parsed_skills = [s.strip() for s in raw_skills.split(",") if s.strip()]
        if parsed_skills:
            resume.skills = parsed_skills

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

    return tailored_resume