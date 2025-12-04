import json
from pathlib import Path

from models.resume_models import Resume
from services.job_parser import parse_job_description
from services.tailor_engine import tailor_resume
from services.resume_formatter import format_resume_text


def main():
    # Paths
    project_root = Path(__file__).resolve().parents[1]
    data_dir = project_root / "data"
    resume_path = data_dir / "my_resume.json"
    jd_path = data_dir / "sample_jd.txt"

    # Load resume
    with resume_path.open("r", encoding="utf-8") as f:
        resume_data = json.load(f)
    resume = Resume.model_validate(resume_data)

    # Load JD
    with jd_path.open("r", encoding="utf-8") as f:
        jd_text = f.read()

    # Parse & tailor
    jd = parse_job_description(jd_text)
    tailored_resume = tailor_resume(resume, jd)

    # Print JSON
    print("\n=== Tailored Resume JSON ===\n")
    print(tailored_resume.model_dump_json(indent=2))

    # Print human-readable resume
    print("\n=== Tailored Resume TEXT (Copy-Paste Ready) ===\n")
    formatted = format_resume_text(tailored_resume)
    print(formatted)


if __name__ == "__main__":
    main()
