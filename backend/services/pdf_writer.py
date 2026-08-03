import os
import subprocess
import tempfile
import shutil
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

from models.resume_models import Resume


TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

_NON_TECH_QUALIFIERS = ("computer", "programming", "coding", "software", "tech")


def _dedupe_additional_info_against_technical_skills(resume: Resume) -> None:
    """
    Mutates resume.additional_info in place to avoid showing the same content
    twice when a technical_skills category already covers it (e.g. a
    "Certifications" category in TECHNICAL SKILLS vs. additional_info.certifications).
    Only call this when the TECHNICAL SKILLS section will actually be rendered.
    """
    if not resume.additional_info or not resume.technical_skills:
        return

    labels_lower = [cat.label.lower() for cat in resume.technical_skills]

    if any("certif" in l for l in labels_lower):
        resume.additional_info.certifications = []

    if any(
        "language" in l and not any(q in l for q in _NON_TECH_QUALIFIERS)
        for l in labels_lower
    ):
        resume.additional_info.languages = []

    if any("member" in l for l in labels_lower):
        resume.additional_info.professional_memberships = []


def escape_latex(text: str) -> str:
    """
    Escape special LaTeX characters in text.
    IMPORTANT: Backslash must be escaped FIRST before other characters!
    """
    if not text:
        return ""
    
    if not isinstance(text, str):
        text = str(text)
    
    # Escape backslash first, then other characters
    # Order matters! Do backslash first so other escapes work correctly
    text = text.replace('\\', r'\textbackslash{}')
    
    # Then escape other special characters
    replacements = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\textasciicircum{}',
    }
    
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    return text


# Custom Jinja2 environment for LaTeX
# Use VAR{} instead of {{ }} to avoid conflicts with LaTeX
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    block_start_string='%{',
    block_end_string='%}',
    variable_start_string='VAR{',
    variable_end_string='}',
    comment_start_string='%#{',
    comment_end_string='#%}',
    trim_blocks=True,
    autoescape=False,
    auto_reload=True,  # Force template reload on every render
    cache_size=0,  # Disable template caching
)

# Add escape_latex as a filter
env.filters['escape_latex'] = escape_latex


def render_resume_pdf(resume: Resume, use_technical_skills: bool = True) -> bytes:
    """
    Render a Resume model into a PDF bytes object using a LaTeX template.
    Uses pdflatex for professional typography and precise formatting.

    use_technical_skills: when False, renders the "regular" template - the
    categorized TECHNICAL SKILLS section is omitted even if the resume has
    parsed technical_skills data (falls back to the single-line skills format).
    """
    render_target = resume.model_copy(deep=True)
    if use_technical_skills:
        _dedupe_additional_info_against_technical_skills(render_target)
    else:
        render_target.technical_skills = []

    # Create a temporary directory for LaTeX compilation
    temp_dir = tempfile.mkdtemp()

    try:
        # Render the LaTeX template
        # LaTeX escaping is handled by the |escape_latex filter in the template
        template = env.get_template("resume_template.tex")
        latex_str = template.render(resume=render_target)
        
        # Write LaTeX file
        tex_path = os.path.join(temp_dir, "resume.tex")
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(latex_str)
        
        # Compile with pdflatex
        # Run twice to resolve references and get correct spacing
        for _ in range(2):
            result = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "-output-directory", temp_dir, tex_path],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=120  # Longer timeout for first-time package installation
            )
            
            if result.returncode != 0:
                # Check if pdflatex is installed
                if "not found" in result.stderr or "No such file" in result.stderr:
                    raise RuntimeError(
                        "pdflatex not found. Please install TeX Live or MiKTeX.\n"
                        "Linux: sudo apt-get install texlive-latex-base texlive-fonts-recommended\n"
                        "Mac: brew install --cask mactex-no-gui\n"
                        "Windows: Download and install MiKTeX from https://miktex.org/"
                    )
                
                # LaTeX compilation error
                log_path = os.path.join(temp_dir, "resume.log")
                error_msg = "LaTeX compilation failed."
                if os.path.exists(log_path):
                    with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
                        log_content = f.read()
                        # Extract error lines
                        error_lines = [line for line in log_content.split('\n') if '!' in line or 'Error' in line]
                        if error_lines:
                            error_msg += f"\n{chr(10).join(error_lines[:5])}"
                
                raise RuntimeError(error_msg)
        
        # Read the generated PDF
        pdf_path = os.path.join(temp_dir, "resume.pdf")
        if not os.path.exists(pdf_path):
            raise RuntimeError("PDF file was not generated by pdflatex")
        
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        
        return pdf_bytes
    
    finally:
        # Clean up temporary directory
        try:
            shutil.rmtree(temp_dir)
        except Exception:
            pass  # Ignore cleanup errors



