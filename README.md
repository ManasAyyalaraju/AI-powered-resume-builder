# refactr Chrome Extension — Tester Build

This branch (`extension-release`) contains a **built, ready-to-load copy** of the refactr Chrome
extension — not source code. It's kept separate from `master` so testers can grab just this
folder without pulling in the rest of the app.

Auto-tailors your resume for job postings on LinkedIn, Indeed, Glassdoor, and Handshake.

## First-time setup

**1. Clone just this branch**

```bash
git clone --branch extension-release --single-branch https://github.com/ManasAyyalaraju/AI-powered-resume-builder.git refactr-extension
```

This creates a `refactr-extension` folder containing only these files — not the whole app's
source history.

**2. Load it into Chrome**

1. Open `chrome://extensions` in Chrome.
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked**.
4. Select the `refactr-extension` folder you just cloned.

**3. Pin it**

Click the puzzle-piece icon in Chrome's toolbar, find **refactr**, and click the pin icon so
it's always visible.

**4. Try it out**

- Open a job listing on LinkedIn, Indeed, Glassdoor, or Handshake — the refactr panel should
  pop up automatically. On other sites, click the toolbar icon to open it manually.
- Click **Log in to refactr**. This opens the refactr web app in a new tab to finish login,
  then the extension picks up your session automatically — no need to log in twice.

## Getting updates

Whenever this branch is updated with a new build:

```bash
cd refactr-extension
git pull
```

Then go to `chrome://extensions` and click the **reload icon** (circular arrow) on the refactr
card. That's it — no re-cloning, no re-downloading.

## Things to know

- **Developer mode banner**: Chrome shows a "Disable developer mode extensions" banner on every
  restart when an extension is loaded unpacked. This is expected — just dismiss it.
- **First request can be slow**: the backend sleeps after inactivity on its free hosting tier.
  The very first tailor request after a while can take 30–60 seconds to respond while it wakes
  up — that's normal, not a hang.
- **Don't delete the cloned folder** — Chrome loads the extension live from it.

Found a bug or something confusing? Let the person who sent you this know — that's exactly what
this testing round is for.
