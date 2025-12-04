# AI-Powered Resume Builder

An intelligent resume tailoring system that uses AI to automatically customize your resume for specific job descriptions. The system analyzes job postings, extracts key requirements, and optimizes your resume content to better match the position.

## Features

- 📄 **PDF Resume Parsing**: Automatically extracts information from PDF resumes
- 🎯 **Job Description Analysis**: Parses and analyzes job descriptions to identify key requirements
- 🤖 **AI-Powered Tailoring**: Uses LLM to intelligently tailor resume content to match job descriptions
- 🔍 **Keyword Extraction**: Identifies must-have and nice-to-have skills from job descriptions
- 📝 **Multiple Output Formats**: Generate tailored resumes as JSON or PDF
- 🚀 **RESTful API**: FastAPI-based backend for easy integration
- 💻 **CLI Support**: Command-line interface for quick resume tailoring

## Project Structure

```
auto-resume/
├── backend/
│   ├── core/
│   │   └── config.py          # Configuration settings
│   ├── models/
│   │   ├── resume_models.py   # Resume data models
│   │   └── job_models.py      # Job description models
│   ├── routers/
│   │   └── tailor_routes.py   # API endpoints
│   ├── services/
│   │   ├── llm_client.py      # LLM integration
│   │   ├── pdf_reader.py      # PDF reading utilities
│   │   ├── pdf_resume_parser.py # Resume PDF parsing
│   │   ├── pdf_writer.py      # PDF generation
│   │   ├── job_parser.py      # Job description parsing
│   │   ├── keyword_extractor.py # Keyword extraction
│   │   ├── tailor_engine.py   # Core tailoring logic
│   │   └── resume_formatter.py # Resume formatting
│   ├── templates/
│   │   └── resume_template.html # PDF resume template
│   ├── app.py                 # FastAPI application
│   ├── main.py                # Alternative entry point
│   ├── cli_demo.py            # CLI interface
│   └── requirements.txt       # Python dependencies
├── data/
│   ├── sample_jd.txt          # Sample job description
│   └── my_resume.json         # Personal resume (gitignored)
└── README.md
```

## Prerequisites

- Python 3.11 or higher
- OpenAI API key (or compatible LLM API)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ManasAyyalaraju/AI-powered-resume-builder.git
   cd AI-powered-resume-builder
   ```

2. **Create a virtual environment**
   ```bash
   cd backend
   python -m venv .venv
   
   # On Windows
   .venv\Scripts\activate
   
   # On macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

## Usage

### CLI Mode

Run the CLI demo to tailor a resume from JSON:

```bash
cd backend
python cli_demo.py
```

This will:
- Load your resume from `data/my_resume.json`
- Load job description from `data/sample_jd.txt`
- Generate a tailored resume
- Output both JSON and formatted text

### API Mode

1. **Start the FastAPI server**
   ```bash
   cd backend
   uvicorn app:app --reload
   ```

2. **API Endpoints**

   #### Health Check
   ```bash
   GET http://localhost:8000/health
   ```

   #### Tailor Resume from PDF
   ```bash
   POST http://localhost:8000/api/tailor/pdf
   ```
   
   **Request:**
   - `pdf`: Resume PDF file (multipart/form-data)
   - `jd_text`: Job description text (form field)
   - `output`: Output format - "json" (default) or "pdf" (form field)
   
   **Example using curl:**
   ```bash
   curl -X POST "http://localhost:8000/api/tailor/pdf" \
     -F "pdf=@/path/to/resume.pdf" \
     -F "jd_text=$(cat /path/to/job_description.txt)" \
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
                   "output": "json"
               }
           )
   
   tailored_resume = response.json()
   ```

3. **API Documentation**
   
   Once the server is running, visit:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## How It Works

1. **Resume Parsing**: Extracts structured data from PDF resumes or JSON files
2. **Job Analysis**: Parses job descriptions to identify:
   - Required skills and qualifications
   - Preferred qualifications
   - Key responsibilities
   - Company information
3. **Keyword Extraction**: Identifies must-have and nice-to-have skills from the job description
4. **AI Tailoring**: Uses LLM to:
   - Optimize resume sections to match job requirements
   - Enhance bullet points with relevant keywords
   - Reorder and prioritize content
   - Suggest improvements based on job description
5. **Output Generation**: Produces tailored resume in JSON or PDF format

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=your_openai_api_key
```

The configuration is managed in `backend/core/config.py` using Pydantic Settings.

## Dependencies

Key dependencies include:
- **FastAPI**: Modern web framework for building APIs
- **OpenAI**: LLM integration for resume tailoring
- **xhtml2pdf**: PDF generation from HTML templates
- **Pydantic**: Data validation and settings management
- **python-dotenv**: Environment variable management

See `backend/requirements.txt` for the complete list.

## Development

### Project Structure

- **Models**: Pydantic models for resume and job description data structures
- **Services**: Core business logic for parsing, tailoring, and formatting
- **Routers**: FastAPI route handlers for API endpoints
- **Templates**: HTML template for PDF resume generation

### Adding New Features

1. **New Resume Sections**: Update `backend/models/resume_models.py`
2. **Custom Tailoring Logic**: Modify `backend/services/tailor_engine.py`
3. **New API Endpoints**: Add routes in `backend/routers/tailor_routes.py`
4. **PDF Template Changes**: Edit `backend/templates/resume_template.html`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**Manas Ayyalaraju**
- GitHub: [@ManasAyyalaraju](https://github.com/ManasAyyalaraju)

## Acknowledgments

- Built with FastAPI and OpenAI
- Uses xhtml2pdf for PDF generation

