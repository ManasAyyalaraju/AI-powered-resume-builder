# Chrome Extension

This folder contains a load-unpacked Chrome extension that mirrors the four popup states from Figma:

- Empty upload state
- Refactoring state
- Downloading state
- Match summary state

## What it does

The popup reads the current browser tab, extracts the visible job description, uploads a PDF resume to the local FastAPI backend, shows the match summary, and downloads the tailored PDF.

## Local setup

1. Install the existing repo dependencies:
   - Frontend: `cd frontend && npm install`
   - Backend: `python3 -m venv backend/.venv && backend/.venv/bin/pip install -r backend/requirements.txt`
2. Create `backend/.env` with a real `OPENAI_API_KEY`.
3. Install `pdflatex` on the machine for PDF generation.
4. Start the API:
   - `cd backend`
   - `source .venv/bin/activate`
   - `uvicorn app:app --reload`
5. Open Chrome at `chrome://extensions`.
6. Enable Developer Mode.
7. Click `Load unpacked`.
8. Select this `extension/` folder.

## Notes

- The popup is currently configured for `http://localhost:8000`.
- If you point the backend somewhere else, update `DEFAULT_API_BASE_URL` in [popup.js](/Users/vyomsethia/Desktop/AI-powered-resume-builder/extension/popup.js).
- The extension works best on job listing pages where the role title and description are visible in the DOM.
