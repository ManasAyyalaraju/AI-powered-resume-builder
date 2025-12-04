from io import BytesIO
import os

from jinja2 import Environment, FileSystemLoader, select_autoescape
from xhtml2pdf import pisa

from models.resume_models import Resume


TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")


env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


def render_resume_pdf(resume: Resume) -> bytes:
    """
    Render a Resume model into a PDF bytes object using an HTML template.
    Uses xhtml2pdf (pisa) which is easier to run cross-platform than WeasyPrint.
    """
    template = env.get_template("resume_template.html")
    html_str = template.render(resume=resume)

    pdf_io = BytesIO()
    # xhtml2pdf expects a file-like buffer for both HTML and PDF.
    pisa_status = pisa.CreatePDF(
        src=html_str,
        dest=pdf_io,
        encoding="utf-8",
    )

    if pisa_status.err:
        # In a real app you might want to log this; for now raise a simple error.
        raise RuntimeError("Failed to generate PDF with xhtml2pdf")

    pdf_io.seek(0)
    return pdf_io.read()

