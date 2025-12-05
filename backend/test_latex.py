"""
Quick test script to verify LaTeX PDF generation is working.
Run this after installing LaTeX to ensure everything is set up correctly.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from models.resume_models import Resume, Contact, EducationEntry, Experience, Project
from services.pdf_writer import render_resume_pdf


def test_latex_installation():
    """Test if LaTeX is installed and accessible."""
    import subprocess
    try:
        result = subprocess.run(
            ["pdflatex", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print("✅ LaTeX (pdflatex) is installed")
            print(f"   Version: {result.stdout.split(chr(10))[0]}")
            return True
        else:
            print("❌ LaTeX is installed but not working correctly")
            return False
    except FileNotFoundError:
        print("❌ LaTeX (pdflatex) is NOT installed")
        print("\nPlease install LaTeX:")
        print("  Windows: https://miktex.org/")
        print("  macOS:   brew install --cask mactex-no-gui")
        print("  Linux:   sudo apt-get install texlive-latex-base texlive-fonts-recommended")
        return False
    except Exception as e:
        print(f"❌ Error checking LaTeX: {e}")
        return False


def test_pdf_generation():
    """Test PDF generation with a sample resume."""
    print("\n🔄 Testing PDF generation...")
    
    # Create a sample resume
    resume = Resume(
        name="John Doe",
        contact=Contact(
            email="john.doe@example.com",
            phone="(555) 123-4567",
            linkedin="linkedin.com/in/johndoe"
        ),
        education=[
            EducationEntry(
                school="University of Example",
                degree="Bachelor of Science, Computer Science",
                graduation_date="May 2024",
                gpa="3.8"
            )
        ],
        experience=[
            Experience(
                company="Tech Company",
                title="Software Engineer",
                location="San Francisco, CA",
                start_date="June 2024",
                end_date="Present",
                bullets=[
                    "Developed scalable web applications using Python and FastAPI",
                    "Implemented CI/CD pipelines reducing deployment time by 50%",
                    "Collaborated with cross-functional teams to deliver features"
                ]
            )
        ],
        projects=[
            Project(
                name="AI Resume Builder",
                role="Lead Developer",
                semester="Fall 2023",
                bullets=[
                    "Built an AI-powered resume tailoring system using OpenAI API",
                    "Implemented LaTeX-based PDF generation for professional output"
                ]
            )
        ],
        skills=["Python", "FastAPI", "LaTeX", "OpenAI", "Git"]
    )
    
    try:
        # Generate PDF
        pdf_bytes = render_resume_pdf(resume)
        
        # Save to file
        output_path = Path(__file__).parent / "test_output.pdf"
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)
        
        print(f"✅ PDF generated successfully!")
        print(f"   Output: {output_path}")
        print(f"   Size: {len(pdf_bytes):,} bytes")
        return True
        
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("LaTeX PDF Generation Test")
    print("=" * 60)
    
    # Test 1: LaTeX installation
    latex_ok = test_latex_installation()
    
    if not latex_ok:
        print("\n⚠️  Please install LaTeX before continuing.")
        print("   See LATEX_SETUP.md for instructions.")
        sys.exit(1)
    
    # Test 2: PDF generation
    pdf_ok = test_pdf_generation()
    
    # Summary
    print("\n" + "=" * 60)
    if latex_ok and pdf_ok:
        print("✅ All tests passed! LaTeX PDF generation is working.")
        print("\nYou can now use the resume builder with LaTeX output.")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
    print("=" * 60)


if __name__ == "__main__":
    main()

