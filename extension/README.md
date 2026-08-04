# refactr Chrome Extension

Auto-detects job postings on LinkedIn (and a curated list of other job boards) and offers to tailor your resume for that job, right from the page. Requires a refactr account and at least one resume saved via the web app (tailor or reformat a resume once at the web app to save your first one).

## How it works

- **Auto mode**: on a matched job board URL (LinkedIn `/jobs/view/*`, Indeed, Glassdoor, Handshake), a content script extracts the job description and shows a small dismissible prompt in the corner of the page. Opening it shows the full panel: log in, pick a saved resume, pick Regular/Technical template, tailor, and download.
- **Manual mode**: click the toolbar icon on any page. It tries to extract a job description from whatever page is open and shows the same panel.
- **Login**: clicking "Log in to refactr" opens the web app's `/extension/connect` page in a new tab (logging in there if needed). Once that page confirms a session, it hands the session tokens to the extension via `chrome.runtime.sendMessage` (see `externally_connectable` in `manifest.json`, and the `onMessageExternal` listener in `src/background.ts`) — the extension panel is polling in the background and picks it up automatically, no manual step needed. A website and an extension are different security origins and don't share cookies/localStorage, which is why this explicit handoff exists rather than just linking to the login page.
  - This relies on the extension having a **stable ID** (set via the `key` field in `manifest.json`, generated once from a throwaway RSA keypair) so the web app always knows which extension to message, regardless of the local unpacked-extension path. Don't remove or regenerate that `key` unless you also update `EXTENSION_ID` in `frontend/lib/extension.ts` to match.
- Saved-resume data uses the same Supabase project as the web app. The extension only calls the existing `/api/tailor/pdf` backend endpoint to generate the PDF; auth, resume storage, and history are handled directly against Supabase from the extension, the same pattern the web app uses.

## Local setup

1. `cd extension && npm install`
2. `npm run build` (or `npm run watch` during development) — builds into `extension/dist/`
3. Make sure the backend (`http://localhost:8000`) and web app (`http://localhost:3000`) are both running locally. To point at deployed versions instead, change `API_BASE_URL` / `WEB_APP_URL` in `src/lib/config.ts` and rebuild.
4. Open `chrome://extensions`, enable Developer Mode, click **Load unpacked**, and select `extension/dist`.
5. Visit a LinkedIn job posting, or click the toolbar icon on any page.

## Known limitations (v1)

- JD extraction is DOM-selector-based and best-effort outside LinkedIn (Indeed/Glassdoor/Handshake selectors, plus a generic fallback) — these sites change their markup periodically, so extraction may degrade over time and need selector updates in `src/lib/extract-jd.ts`.
- The extension only lets you pick from resumes already saved to your account; it doesn't support uploading a fresh PDF from within the extension itself.
- LinkedIn's job pages are a single-page app, so the content script polls for URL changes (rather than reloading) to re-detect new job postings as you browse.
