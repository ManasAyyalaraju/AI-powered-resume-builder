from models.resume_models import Resume


def format_resume_text(resume: Resume) -> str:
    """
    Convert the Resume model into a clean, human-readable text resume.
    Structured to mimic your real resume sections:
    - Name + contact
    - Headline / Summary
    - EDUCATION
    - EXPERIENCE
    - PROJECTS
    - ADDITIONAL INFORMATION (including Computer Skills)
    """

    lines: list[str] = []

    # Name
    lines.append(resume.name.upper())
    lines.append("=" * len(resume.name))
    lines.append("")

    # Contact
    if resume.contact:
        contact_bits = []
        if resume.contact.email:
            contact_bits.append(resume.contact.email)
        if resume.contact.phone:
            contact_bits.append(resume.contact.phone)
        if resume.contact.linkedin:
            contact_bits.append(resume.contact.linkedin)
        if resume.contact.location:
            contact_bits.append(resume.contact.location)

        if contact_bits:
            lines.append(" | ".join(contact_bits))
            lines.append("")

    # EDUCATION
    if resume.education:
        lines.append("EDUCATION")
        for edu in resume.education:
            lines.append(f"{edu.school} — {edu.location or ''}".strip())
            lines.append(edu.degree)
            if edu.graduation_date or edu.gpa:
                details = []
                if edu.graduation_date:
                    details.append(f"Graduation: {edu.graduation_date}")
                if edu.gpa:
                    details.append(f"GPA: {edu.gpa}")
                lines.append(" | ".join(details))
            lines.append("")
        lines.append("")

    # EXPERIENCE
    if resume.experience:
        lines.append("EXPERIENCE")
        for exp in resume.experience:
            # Title, Company, Location
            header = exp.title
            if exp.company:
                header += f", {exp.company}"
            if exp.location:
                header += f" — {exp.location}"
            lines.append(header)

            # Dates
            if exp.start_date or exp.end_date:
                date_range = (exp.start_date or "") + " to " + (exp.end_date or "Present")
                lines.append(date_range)

            # Bullets
            for b in exp.bullets:
                lines.append(f"- {b}")
            lines.append("")
        lines.append("")

    # PROJECTS
    if resume.projects:
        lines.append("PROJECTS")
        for proj in resume.projects:
            header = proj.name
            if proj.role:
                header += f" — {proj.role}"
            lines.append(header)
            for b in proj.bullets:
                lines.append(f"- {b}")
            lines.append("")
        lines.append("")

    # ADDITIONAL INFORMATION
    if resume.additional_info or resume.skills:
        lines.append("ADDITIONAL INFORMATION")

        # Computer Skills from top-level skills
        if resume.skills:
            lines.append("Computer Skills: " + ", ".join(resume.skills))

        if resume.additional_info:
            if resume.additional_info.certifications:
                lines.append(
                    "Certifications: " + ", ".join(resume.additional_info.certifications)
                )
            if resume.additional_info.languages:
                lines.append(
                    "Languages: " + ", ".join(resume.additional_info.languages)
                )
            if resume.additional_info.work_eligibility:
                lines.append("Work Eligibility: " + resume.additional_info.work_eligibility)
            if resume.additional_info.other:
                lines.append(resume.additional_info.other)

        lines.append("")

    return "\n".join(lines)
