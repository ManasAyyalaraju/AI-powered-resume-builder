# refactr

**Tailor your resume to any job in seconds — from a web app, or straight off the job posting.**

Upload a resume once. Tailor it against a job description or reformat it into a clean, ATS-friendly PDF — either from the web app or directly on LinkedIn, Indeed, Glassdoor, or Handshake via the refactr Chrome extension.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.123-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)](https://platform.openai.com/)

**Live app:** [ai-powered-resume-builder-peach.vercel.app](https://ai-powered-resume-builder-peach.vercel.app)

---

## What it does

- **Upload once** — a resume PDF is parsed into structured data and saved to your library; every saved resume is normalized through the reformatter first, so it's always in a clean, consistent template.
- **Tailor** an existing saved resume against a job description — rewrites the summary and bullets to match, without ever changing companies, titles, dates, or locations, and without letting the model claim skills you don't actually have (see [The tailoring pipeline](#the-tailoring-pipeline)).
- **Reformat** any resume into a polished, ATS-friendly PDF with zero content rewriting — bullets are preserved verbatim, only formatting changes.
- **Two templates** — a standard layout, and a Technical Skills layout with categorized skill sections.
- **Chrome extension** — auto-appears on job postings on LinkedIn, Indeed, Glassdoor, and Handshake, and tailors one of your saved resumes against the page you're already looking at, without leaving the tab.
- **Dashboard** — your current resume, resume history, and job-application stats at a glance.
- **One identity everywhere** — the web app and the extension share the exact same Supabase-backed auth and storage, so signing in once on the web logs you into the extension too.

## Architecture

refactr is three coordinated pieces, deliberately kept loosely coupled:

| Piece | Stack | Role |
|---|---|---|
| **Web app** (`frontend/`) | Next.js 16, React 19, TypeScript, Tailwind | Upload, tailor, reformat, dashboard — talks to Supabase directly |
| **Chrome extension** (`extension/`) | Manifest V3, TypeScript, esbuild | Same tailor/reformat flow, triggered from job board pages |
| **Backend** (`backend/`) | FastAPI, OpenAI, LaTeX | Stateless — parses, tailors, reformats, and renders PDFs. Nothing else. |

```
 ┌──────────────┐
 │   Web app     │──────┐
 │  (Next.js)    │      │
 └──────────────┘      ▼
                 ┌──────────────────┐
                 │     Supabase      │   Auth · Postgres · private Storage
 ┌──────────────┐│  (RLS on auth.uid)│
 │  Extension    │──────┐
 │ (Manifest V3) │      │
 └───────┬──────┘      ▼
         │        (auth/storage is 100% frontend-driven)
         │  PDF + JD text only — no credentials, no user data
         ▼
 ┌──────────────┐
 │   Backend     │   Parse → Tailor / Reformat → Render PDF
 │  (FastAPI)    │   (OpenAI + LaTeX — fully stateless)
 └──────────────┘
```

**The backend never talks to Supabase and never sees a service-role key.** Auth, persistence, and file storage all happen frontend-driven — the web app and the extension both talk to Supabase directly via `supabase-js`, protected by row-level security scoped to `auth.uid()`. This means the extension reuses the exact same auth/storage logic as the web app instead of duplicating it across two codebases, and it keeps the backend's blast radius small: a Supabase outage never takes down the core tailor/reformat pipeline.

## The tailoring pipeline

The part that actually does the work is built as a small pipeline of specialized steps rather than one giant prompt:

1. **Parse** — the resume PDF and the job description are parsed *concurrently* (they don't depend on each other), each through an OpenAI structured-outputs call bound to a Pydantic schema, so a malformed response isn't a failure mode.
2. **Classify** — the job's industry and sub-domain are classified in the *same* call that parses the JD, not a separate round-trip, and cached in-process so tailoring the same JD against multiple resumes doesn't re-pay for it.
3. **Generate** — bullets are rewritten to match the job, with domain-specific guidance (tone, terminology, skill priorities) injected into the prompt as a short, bounded briefing — enough to steer word choice without bloating the prompt.
4. **Verify** — every tailored bullet is checked against the job's required skills: if a skill appears that wasn't in the original bullet or anywhere in the candidate's own resume, it's rewritten once with the specific violation named, or reverted to the original wording if that doesn't resolve it. The model never gets to silently invent a skill the candidate doesn't have.
5. **Lock** — company, title, dates, locations, and bullet counts are enforced in code after generation, never just trusted to the prompt.

Every stage is timed and surfaced via an `X-Pipeline-Timings` response header for observability.

## Prerequisites

### Backend
- Python 3.11+
- OpenAI API key
- A LaTeX distribution (for PDF rendering):
  - **macOS**: `brew install --cask mactex-no-gui`
  - **Windows**: [MiKTeX](https://miktex.org/)
  - **Linux**: `sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-latex-extra`

### Frontend
- Node.js 18+ and npm
- A Supabase project (Postgres + Auth + Storage)

### Chrome extension
- Node.js 18+ and npm
- Chrome 116+

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` (see `backend/.env.example`):

```env
OPENAI_API_KEY=your_api_key_here

# Optional — model tiering and retry behavior, see .env.example for defaults
# OPENAI_MODEL_FAST=gpt-4o-mini
# OPENAI_MODEL_GENERATE=gpt-4o-mini
# OPENAI_MAX_RETRIES=2
```

Install LaTeX (see [LATEX_SETUP.md](LATEX_SETUP.md)), then start the server:

```bash
uvicorn app:app --reload
```

Backend runs on `http://localhost:8000` — API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

### Chrome extension

```bash
cd extension
npm install
npm run build
```

Then in `chrome://extensions`: enable Developer Mode → **Load unpacked** → select `extension/dist`. By default the extension points at the deployed backend/web app (see `extension/src/lib/config.ts`); point it at `localhost` for local development.

## API surface

| Endpoint | Purpose |
|---|---|
| `POST /api/tailor/pdf` | Multipart `{pdf, jd_text, output: json\|pdf, resume_format: regular\|technical}` — tailor a resume against a job description |
| `POST /api/reformat/pdf` | Multipart `{pdf, resume_format}` — reformat a resume with no content rewriting |
| `GET /api/templates/preview?format=regular\|technical` | Static example resume rendered through the real pipeline — no upload, no AI call |
| `GET /health` | Health check |

**Example:**

```bash
curl -X POST "http://localhost:8000/api/tailor/pdf" \
  -F "pdf=@resume.pdf" \
  -F "jd_text=$(cat job_description.txt)" \
  -F "output=json"
```

### CLI demo

```bash
cd backend
python cli_demo.py
```

## Project structure

```
refactr/
├── backend/
│   ├── core/
│   │   ├── config.py               # Settings (API key, model tiering, retries)
│   │   ├── exceptions.py           # TailoringGenerationError
│   │   └── timing.py               # Per-stage pipeline timing helper
│   ├── models/
│   │   ├── resume_models.py        # Resume data models
│   │   └── job_models.py           # Job description models
│   ├── routers/
│   │   ├── tailor_routes.py        # POST /api/tailor/pdf
│   │   ├── reformat_routes.py      # POST /api/reformat/pdf
│   │   └── template_preview_routes.py
│   ├── services/
│   │   ├── llm_client.py           # OpenAI calls (structured outputs, async)
│   │   ├── job_parser.py           # JD parsing + domain classification
│   │   ├── domain_prompts.py       # Domain-specific tailoring guidance
│   │   ├── bullet_verifier.py      # Truthfulness guardrail on tailored bullets
│   │   ├── pdf_resume_parser.py    # Resume PDF → structured data
│   │   ├── pdf_writer.py           # PDF generation (LaTeX)
│   │   ├── tailor_engine.py        # Core tailoring orchestration
│   │   └── reformat_engine.py      # Core reformatting orchestration
│   ├── templates/
│   │   └── resume_template.tex     # LaTeX resume template
│   ├── app.py                      # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── (landing) page.tsx, login/, signup/, auth/
│   │   ├── dashboard/              # Current resume, history, stats
│   │   ├── resumes/                # Upload → template choice → save
│   │   ├── tailor/, results/       # Tailor flow + results view
│   │   ├── extension/connect/      # Session handoff to the Chrome extension
│   │   └── profile/
│   ├── components/, lib/, types/
│   └── package.json
├── extension/
│   ├── src/
│   │   ├── background.ts, content-script.ts, panel-app.ts
│   │   └── lib/                    # Supabase client, API client, config
│   ├── manifest.json               # Manifest V3, matches LinkedIn/Indeed/Glassdoor/Handshake
│   └── package.json
├── data/
│   └── sample_jd.txt
├── CLAUDE.md                       # Architecture reference
├── memory.md                       # Decision log — the "why" behind non-obvious choices
├── DEPLOYMENT.md                   # Production deployment guide
├── LATEX_SETUP.md                  # LaTeX installation guide
└── README.md
```

## Deployment

- **Backend** → [Render](https://render.com/) (Docker, see `backend/Dockerfile` and `render.yaml`)
- **Frontend** → [Vercel](https://vercel.com/)
- **Database/Auth/Storage** → [Supabase](https://supabase.com/)

Full step-by-step instructions, environment variable reference, and troubleshooting are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Security

- Backend never holds Supabase credentials — no service-role key, no direct DB access
- All persistence protected by Postgres row-level security scoped to `auth.uid()`
- Storage buckets are private; object paths must start with `{user_id}/...`
- Environment variables for all secrets; CORS configured per environment
- LaTeX special-character escaping and secure temp file handling in the PDF pipeline

## Development notes

- [CLAUDE.md](CLAUDE.md) — architecture reference: stack, data model, routes, local dev commands
- [memory.md](memory.md) — a running decision log of *why* things are built the way they are, for anything that isn't obvious from reading the code

## Author

**Manas Ayyalaraju**
- GitHub: [@ManasAyyalaraju](https://github.com/ManasAyyalaraju)

---

**Need help?** API docs live at `http://localhost:8000/docs` once the backend is running.
