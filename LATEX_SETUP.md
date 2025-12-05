# LaTeX Setup Instructions

The resume system now uses LaTeX for PDF generation, providing professional typography and precise formatting control.

## Installation

### Windows

1. **Download MiKTeX**

   - Visit: https://miktex.org/download
   - Download and run the installer
   - Choose "Install MiKTeX for all users" (recommended)
   - During installation, set "Install missing packages" to "Yes"

2. **Verify Installation**
   ```powershell
   pdflatex --version
   ```

### macOS

1. **Install MacTeX (Smaller Version)**

   ```bash
   brew install --cask mactex-no-gui
   ```

   Or download from: https://www.tug.org/mactex/morepackages.html

2. **Add to PATH** (if needed)

   ```bash
   export PATH="/Library/TeX/texbin:$PATH"
   ```

3. **Verify Installation**
   ```bash
   pdflatex --version
   ```

### Linux (Ubuntu/Debian)

1. **Install TeX Live**

   ```bash
   sudo apt-get update
   sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-latex-extra
   ```

2. **Verify Installation**
   ```bash
   pdflatex --version
   ```

### Linux (Fedora/RHEL)

```bash
sudo dnf install texlive-scheme-basic texlive-collection-fontsrecommended
```

## Required Packages

The following LaTeX packages are used (included in the installations above):

- `geometry` - Page margins
- `enumitem` - List formatting
- `hyperref` - Hyperlinks
- `titlesec` - Section formatting
- `fontenc` - Font encoding

## Testing

After installation, test the system:

```bash
cd backend
python -c "from services.pdf_writer import render_resume_pdf; print('LaTeX PDF writer ready!')"
```

## Troubleshooting

### "pdflatex not found"

- Make sure LaTeX is installed and in your PATH
- Restart your terminal/IDE after installation
- On Windows, you may need to restart your computer

### "Package X not found"

- MiKTeX will auto-install missing packages on first run
- On Linux, install additional packages: `sudo apt-get install texlive-latex-extra`

### Compilation Errors

- Check the error message in the exception
- LaTeX log files are created in temp directory during compilation
- Common issues: special characters not escaped, missing fonts

## Benefits of LaTeX

✅ **Professional Typography** - Superior to HTML/CSS rendering
✅ **Precise Control** - Exact spacing and alignment
✅ **ATS-Friendly** - Clean, structured PDF output
✅ **Consistent** - Same output across all platforms
✅ **Industry Standard** - Used for academic and professional documents

## Reverting to HTML (if needed)

If you need to revert to the HTML-based PDF generation:

1. Restore the old `pdf_writer.py` from git history
2. Use `resume_template.html` instead of `resume_template.tex`
3. Install `xhtml2pdf` or `weasyprint`

However, LaTeX provides much better formatting and is recommended for production use.
