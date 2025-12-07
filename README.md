# AI-Powered Resume Tailor

An intelligent resume tailoring system that uses AI to automatically customize your resume for specific job descriptions. Upload your resume PDF, paste a job description, and get a professionally tailored resume optimized for ATS systems.

## 🚀 Features

- **PDF Resume Parsing**: Automatically extracts structured data from any PDF resume
- **AI-Powered Tailoring**: Uses domain-specific prompts to tailor content intelligently
- **Domain Detection**: Automatically detects job industry and sub-domain for precise tailoring
- **Professional PDF Generation**: LaTeX-based PDF output with superior typography
- **RESTful API**: FastAPI backend with comprehensive API documentation
- **Modern Frontend**: Next.js web interface with drag-and-drop functionality
- **ATS-Optimized**: Generates resumes optimized for Applicant Tracking Systems

## 📋 Prerequisites

### Backend
- Python 3.11 or higher
- OpenAI API key
- LaTeX distribution (for PDF generation):
  - **Windows**: [MiKTeX](https://miktex.org/)
  - **macOS**: `brew install --cask mactex-no-gui`
  - **Linux**: `sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-latex-extra`

### Frontend
- Node.js 18+ and npm

## ⚙️ Installation & Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   
   # Windows
   .venv\Scripts\activate
   
   # macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create `.env` file in `backend/` directory:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

5. **Install LaTeX** (see [LATEX_SETUP.md](LATEX_SETUP.md) for detailed instructions)

6. **Start the server**
   ```bash
   uvicorn app:app --reload
   ```
   
   Backend will run on `http://localhost:8000`
   
   API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file in `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:3000`

## 🎯 Usage

### Web Interface

1. Visit `http://localhost:3000`
2. Click "Get Started" or navigate to the Tailor page
3. Upload your resume PDF (drag-and-drop or click to browse)
4. Paste the job description
5. Click "Tailor My Resume"
6. View results and download your tailored resume

### API Usage

**Endpoint**: `POST /api/tailor/pdf`

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/api/tailor/pdf" \
  -F "pdf=@resume.pdf" \
  -F "jd_text=$(cat job_description.txt)" \
  -F "output=json"
```

**Example using Python:**
```python
import requests

with open("resume.pdf", "rb") as pdf_file:
    with open("job_description.txt", "r") as jd_file:
        response = requests.post(
            "http://localhost:8000/api/tailor/pdf",
            files={"pdf": pdf_file},
            data={
                "jd_text": jd_file.read(),
                "output": "json"  # or "pdf"
            }
        )

tailored_resume = response.json()
```

### CLI Demo

```bash
cd backend
python cli_demo.py
```

## 📁 Project Structure

```
auto-resume/
├── backend/
│   ├── core/
│   │   └── config.py              # Configuration settings
│   ├── models/
│   │   ├── resume_models.py       # Resume data models
│   │   └── job_models.py          # Job description models
│   ├── routers/
│   │   └── tailor_routes.py       # API endpoints
│   ├── services/
│   │   ├── domain_detector.py     # Domain detection logic
│   │   ├── domain_prompts.py      # Domain-specific prompts
│   │   ├── llm_client.py          # LLM integration
│   │   ├── pdf_resume_parser.py   # Resume PDF parsing
│   │   ├── pdf_writer.py          # PDF generation (LaTeX)
│   │   ├── job_parser.py          # Job description parsing
│   │   ├── keyword_extractor.py   # Keyword extraction
│   │   ├── tailor_engine.py       # Core tailoring logic
│   │   └── resume_formatter.py    # Resume formatting
│   ├── templates/
│   │   └── resume_template.tex    # LaTeX resume template
│   ├── app.py                     # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Docker configuration
├── frontend/
│   ├── app/                       # Next.js pages
│   ├── components/                # React components
│   ├── lib/                       # Utilities and API client
│   ├── types/                     # TypeScript types
│   └── package.json               # Node dependencies
├── data/
│   └── sample_jd.txt              # Sample job description
├── DEPLOYMENT.md                  # Deployment guide
├── LATEX_SETUP.md                 # LaTeX installation guide
└── README.md                      # This file
```

## 🤖 How It Works

1. **Resume Parsing**: Extracts structured data from PDF using LLM
2. **Job Analysis**: Parses job description to identify requirements and key skills
3. **Domain Detection**: Automatically identifies job industry and sub-domain
4. **Keyword Extraction**: Identifies must-have and nice-to-have skills
5. **AI Tailoring**: Uses domain-specific prompts to optimize resume content
6. **PDF Generation**: Creates professional PDF using LaTeX with superior typography

### Supported Domains

**Technology**: Software Engineering, Data Analyst, ML/AI, Analytics Engineering, Cloud/DevOps  
**Finance**: Commercial Banking, Investment Banking  
**Healthcare**: Clinical  
**Marketing**: Digital Marketing

More domains can be easily added in `backend/services/domain_prompts.py`

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Backend: Render.com (Docker-based)
- Frontend: Vercel

Quick deployment summary:
1. Push code to GitHub
2. Deploy backend to Render using Docker
3. Set `OPENAI_API_KEY` environment variable
4. Deploy frontend to Vercel
5. Set `NEXT_PUBLIC_API_URL` environment variable

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:8000/health

# API documentation
open http://localhost:8000/docs
```

### Test Frontend
```bash
# Build test
cd frontend
npm run build

# Start production server
npm start
```

## 🛠️ Development

### Adding New Domains

1. Add to `backend/services/domain_detector.py` detection list
2. Add domain-specific prompt in `backend/services/domain_prompts.py`
3. Test with sample job descriptions

### Customizing LaTeX Template

Edit `backend/templates/resume_template.tex` to modify resume layout and styling.

See [LATEX_SETUP.md](LATEX_SETUP.md) for template customization guide.

## 📚 Dependencies

### Backend
- **FastAPI**: Web framework for API
- **OpenAI**: LLM integration
- **Pydantic**: Data validation
- **Jinja2**: Template rendering
- **LaTeX (pdflatex)**: PDF generation

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **react-dropzone**: File upload

See `backend/requirements.txt` and `frontend/package.json` for complete lists.

## 🔒 Security

- Environment variables for sensitive data
- CORS properly configured
- Input validation on all endpoints
- LaTeX special character escaping
- Secure temp file handling

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Manas Ayyalaraju**
- GitHub: [@ManasAyyalaraju](https://github.com/ManasAyyalaraju)

## 🙏 Acknowledgments

- Built with FastAPI and OpenAI
- LaTeX for professional PDF generation
- Next.js for modern web interface

## 📖 Additional Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [LATEX_SETUP.md](LATEX_SETUP.md) - LaTeX installation and troubleshooting

## 🆘 Support

For issues or questions:
1. Check documentation files (DEPLOYMENT.md, LATEX_SETUP.md)
2. Review API documentation at `/docs` endpoint
3. Open an issue on GitHub

---

**Need help?** Check out the API docs at `http://localhost:8000/docs` after starting the backend!
