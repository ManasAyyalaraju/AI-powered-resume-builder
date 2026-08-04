from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from openai import AuthenticationError

from core.config import settings
from services.pdf_resume_parser import parse_pdf_resume_to_json
from services.pdf_writer import render_resume_pdf
from services.reformat_engine import reformat_resume
from services.tailor_engine import ensure_technical_skills

router = APIRouter(tags=["Reformatter"])


@router.post("/reformat/pdf")
async def reformat_resume_from_pdf(
    pdf: UploadFile = File(...),
    resume_format: str = Form("regular"),
):
    """
    Upload a resume PDF and get a reformatted, ATS-friendly PDF back.
    No JD input and no bullet rewriting.
    """
    try:
        settings.validate_api_key()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    temp_path = f"/tmp/{pdf.filename}"
    with open(temp_path, "wb") as f:
        f.write(await pdf.read())

    try:
        resume = parse_pdf_resume_to_json(temp_path)

        # Normalize skills from computer/technical skills strings into list
        if getattr(resume.additional_info, "computer_skills", None):
            raw_skills = resume.additional_info.computer_skills
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

        # Categorize skills into TECHNICAL SKILLS *before* reformatting so the
        # compact-mode/spacing decision (computed inside reformat_resume) knows
        # about the section that's about to be added - otherwise a resume
        # that's borderline full gets loose spacing and overflows to page 2
        # once the extra section shows up at render time.
        use_technical_skills = resume_format.lower() == "technical"
        if use_technical_skills:
            resume = ensure_technical_skills(resume)

        reformatted = reformat_resume(resume)
        pdf_bytes = render_resume_pdf(reformatted, use_technical_skills=use_technical_skills)

        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="ats_resume.pdf"'
            },
        )
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

