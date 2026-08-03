# refactr Chrome Extension

Auto-detects job postings on LinkedIn (and a curated list of other job boards) and offers to tailor your resume for that job, right from the page. Requires a refactr account and at least one resume saved via the web app (tailor or reformat a resume once at the web app to save your first one).

## How it works

- **Auto mode**: on a matched job board URL (LinkedIn `/jobs/view/*`, Indeed, Glassdoor, Handshake), a content script extracts the job description and shows a small dismissible prompt in the corner of the page. Opening it shows the full panel: log in, pick a saved resume, pick Regular/Technical template, tailor, and download.
- **Manual mode**: click the toolbar icon on any page. It tries to extract a job description from whatever page is open and shows the same panel.
- Login and saved-resume data use the same Supabase project as the web app — logging into the extension is a separate session from the web app (browser extensions can't share cookies/localStorage with a website), but it's the same account.
- The extension only calls the existing `/api/tailor/pdf` backend endpoint to generate the PDF; auth, resume storage, and history are handled directly against Supabase from the extension, the same pattern the web app uses.

## Local setup

1. `cd extension && npm install`
2. `npm run build` (or `npm run watch` during development) — builds into `extension/dist/`
3. Make sure the backend is running locally (`http://localhost:8000` — see `backend/README` / `DEPLOYMENT.md`). To point at a deployed backend instead, change `API_BASE_URL` in `src/lib/config.ts` and rebuild.
4. Open `chrome://extensions`, enable Developer Mode, click **Load unpacked**, and select `extension/dist`.
5. Visit a LinkedIn job posting, or click the toolbar icon on any page.

## Known limitations (v1)

- JD extraction is DOM-selector-based and best-effort outside LinkedIn (Indeed/Glassdoor/Handshake selectors, plus a generic fallback) — these sites change their markup periodically, so extraction may degrade over time and need selector updates in `src/lib/extract-jd.ts`.
- The extension only lets you pick from resumes already saved to your account; it doesn't support uploading a fresh PDF from within the extension itself.
- LinkedIn's job pages are a single-page app, so the content script polls for URL changes (rather than reloading) to re-detect new job postings as you browse.
