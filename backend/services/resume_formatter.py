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

    # Headline
    if resume.headline:
        lines.append(resume.headline)
        lines.append("")

    # Summary
    if resume.summary:
        lines.append(resume.summary)
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
        lines.append("")  # 1 line space before PROJECTS
        lines.append("PROJECTS")
        for proj in resume.projects:
            header = proj.name
            if proj.role:
                header += f" — {proj.role}"
            if proj.semester:
                header += f" ({proj.semester})"
            lines.append(header)
            for b in proj.bullets:
                lines.append(f"- {b}")
            lines.append("")
        lines.append("")

    # VOLUNTEER WORK
    if resume.volunteer_work:
        lines.append("VOLUNTEER WORK")
        for vol in resume.volunteer_work:
            header = vol.organization
            if vol.role:
                header += f" — {vol.role}"
            if vol.location:
                header += f" ({vol.location})"
            lines.append(header)
            if vol.start_date or vol.end_date:
                date_range = (vol.start_date or "") + " to " + (vol.end_date or "Present")
                lines.append(date_range)
            if vol.bullets:
                for b in vol.bullets:
                    lines.append(f"- {b}")
            lines.append("")
        lines.append("")

    # AWARDS
    if resume.awards:
        lines.append("AWARDS & HONORS")
        for award in resume.awards:
            award_line = award.title
            if award.organization:
                award_line += f" — {award.organization}"
            if award.date:
                award_line += f" ({award.date})"
            lines.append(award_line)
            if award.description:
                lines.append(f"  {award.description}")
        lines.append("")

    # PUBLICATIONS
    if resume.publications:
        lines.append("PUBLICATIONS")
        for pub in resume.publications:
            lines.append(pub.title)
            details = []
            if pub.authors:
                details.append(f"Authors: {pub.authors}")
            if pub.venue:
                details.append(f"Venue: {pub.venue}")
            if pub.date:
                details.append(f"Date: {pub.date}")
            if details:
                lines.append(" | ".join(details))
            if pub.url:
                lines.append(f"URL: {pub.url}")
            lines.append("")
        lines.append("")

    # ADDITIONAL INFORMATION
    if resume.additional_info or resume.skills:
        lines.append("ADDITIONAL INFORMATION")

        if resume.additional_info:
            # Computer/Technical Skills (if present as string) - prioritize over top-level skills
            if resume.additional_info.computer_skills:
                lines.append("Computer Skills: " + resume.additional_info.computer_skills)
            elif resume.additional_info.technical_skills:
                lines.append("Technical Skills: " + resume.additional_info.technical_skills)
            elif resume.skills:
                # Only show top-level skills if no computer/technical skills are present
                lines.append("Skills: " + ", ".join(resume.skills))
        elif resume.skills:
            # Show top-level skills if no additional_info
            lines.append("Skills: " + ", ".join(resume.skills))

        if resume.additional_info:
            if resume.additional_info.certifications:
                lines.append(
                    "Certifications: " + ", ".join(resume.additional_info.certifications)
                )
            if resume.additional_info.languages:
                lines.append(
                    "Languages: " + ", ".join(resume.additional_info.languages)
                )
            if resume.additional_info.professional_memberships:
                lines.append(
                    "Professional Memberships: " + ", ".join(resume.additional_info.professional_memberships)
                )
            if resume.additional_info.work_eligibility:
                lines.append("Work Eligibility: " + resume.additional_info.work_eligibility)
            if resume.additional_info.other:
                lines.append(resume.additional_info.other)

        lines.append("")

    return "\n".join(lines)
