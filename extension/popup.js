const DEFAULT_API_BASE_URL = "http://localhost:8000";

const state = {
  screen: "upload",
  selectedFile: null,
  jobContext: null,
  result: null,
  error: "",
};

const app = document.getElementById("app");
const fileInput = document.getElementById("resume-input");

fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  state.selectedFile = file;
  state.result = null;
  state.error = "";
  state.screen = "upload";
  render();
});

init();

async function init() {
  render();

  try {
    state.jobContext = await extractJobContext();
    render();
  } catch (error) {
    console.warn("Job context could not be read yet.", error);
  }
}

function render() {
  app.innerHTML = `
    <section class="popup-shell">
      ${renderHeader()}
      ${renderBody()}
      ${renderFooter()}
    </section>
  `;

  bindUi();
}

function renderHeader() {
  return `
    <header class="popup-header">
      <div class="brand-lockup">
        <span class="brand-mark" aria-hidden="true">${renderLogoIcon()}</span>
        <span class="brand-name">refactr</span>
      </div>
      <button class="close-button" type="button" data-action="close" aria-label="Close popup">
        ${renderCloseIcon()}
      </button>
    </header>
  `;
}

function renderBody() {
  if (state.screen === "refactoring") {
    return `
      <div class="panel loading-panel">
        ${renderSegmentLoader({ animated: true })}
        <p class="loading-copy">Refactoring...</p>
      </div>
    `;
  }

  if (state.screen === "downloading") {
    return `
      <div class="panel download-panel">
        <div class="panel-icon icon-strong">${renderDownloadIcon({ size: 36 })}</div>
        <p class="download-copy"><span>Downloading</span><span>Resume</span></p>
      </div>
    `;
  }

  if (state.screen === "results" && state.result) {
    return renderResultsState();
  }

  return renderUploadState();
}

function renderUploadState() {
  const fileMarkup = state.selectedFile
    ? `
      <div class="selected-file" title="${escapeHtml(state.selectedFile.name)}">
        ${renderDocumentIcon({ size: 16 })}
        <span>${escapeHtml(state.selectedFile.name)}</span>
      </div>
    `
    : "";

  return `
    <button class="panel upload-panel" type="button" data-dropzone="true">
      <div class="panel-stack">
        <div class="panel-icon">${renderUploadIcon({ size: 36 })}</div>
        <p class="upload-copy">
          <strong>Drag</strong> or <span>Upload</span> your resume to get started
        </p>
        ${fileMarkup}
      </div>
    </button>
    ${renderFeedback({ showContext: true })}
  `;
}

function renderResultsState() {
  const jobTitle = getJobTitle();
  const subtitle = getJobSubtitle();
  const compatibility = state.result.compatibility || {};
  const score = compatibility.score || 0;
  const matchedCount = getMatchedCount(compatibility);
  const totalCount = getTotalCount(state.result.job_description);
  const keywords = getKeywordMatches(state.result);

  return `
    <div class="panel result-panel">
      <div class="result-heading">
        <div class="result-title-group">
          <p class="eyebrow">TAILORING FOR</p>
          <p class="role-title">${escapeHtml(jobTitle)}</p>
          <p class="role-subtitle">${escapeHtml(subtitle)}</p>
        </div>
        <div class="score-card">
          ${renderSegmentLoader({ small: true })}
          <div class="score-copy">
            <div class="score-label">
              <span>Match Score</span>
              ${renderInfoIcon()}
            </div>
            <div class="score-value">
              <strong>${score}%</strong>
              ${totalCount ? `<span>(${matchedCount}/${totalCount})</span>` : ""}
            </div>
          </div>
        </div>
      </div>
      <div class="keyword-group">
        <p class="eyebrow">KEYWORD MATCH</p>
        <div class="keyword-list">
          ${keywords
            .map(
              (keyword) => `
                <div class="keyword-chip">
                  <span>${escapeHtml(keyword)}</span>
                  ${renderChipCheckIcon()}
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
    ${renderFeedback()}
  `;
}

function renderFooter() {
  if (state.screen === "refactoring" || state.screen === "downloading") {
    return "";
  }

  const showingResult = state.screen === "results" && state.result;
  const hasFile = Boolean(state.selectedFile);
  const actionsDisabled = !showingResult && !hasFile;

  return `
    <div class="action-row ${actionsDisabled ? "is-muted" : ""}">
      <button
        class="icon-button"
        type="button"
        data-action="pick-file"
        aria-label="Choose a resume"
        title="Choose a resume"
        ${actionsDisabled ? "disabled" : ""}
      >
        ${renderDocumentIcon({ size: 24 })}
      </button>
      <button
        class="icon-button"
        type="button"
        data-action="refresh-job"
        aria-label="Read the current job page again"
        title="Read the current job page again"
        ${actionsDisabled ? "disabled" : ""}
      >
        ${renderUploadIcon({ size: 24 })}
      </button>
      <button
        class="primary-button ${actionsDisabled ? "is-disabled" : ""}"
        type="button"
        data-action="${showingResult ? "download" : "run"}"
        ${actionsDisabled ? "disabled" : ""}
      >
        Refactor + Download
      </button>
    </div>
  `;
}

function renderFeedback({ showContext = false } = {}) {
  if (state.error) {
    return `<p class="feedback is-error">${escapeHtml(state.error)}</p>`;
  }

  if (showContext && state.jobContext?.title) {
    return `<p class="feedback">Current tab: ${escapeHtml(truncate(state.jobContext.title, 46))}</p>`;
  }

  return "";
}

function bindUi() {
  app.querySelector("[data-action='close']")?.addEventListener("click", () => {
    window.close();
  });

  app.querySelector("[data-action='pick-file']")?.addEventListener("click", () => {
    fileInput.click();
  });

  app.querySelector("[data-action='refresh-job']")?.addEventListener("click", async () => {
    try {
      const jobContext = await extractJobContext();
      state.jobContext = jobContext;
      state.result = null;
      state.error = "";
      state.screen = "upload";
      render();
    } catch (error) {
      state.error = toMessage(error);
      render();
    }
  });

  app.querySelector("[data-action='run']")?.addEventListener("click", handleRunTailoring);
  app.querySelector("[data-action='download']")?.addEventListener("click", handleDownloadResume);

  const dropzone = app.querySelector("[data-dropzone='true']");
  if (!dropzone) {
    return;
  }

  dropzone.addEventListener("click", () => {
    fileInput.click();
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-drag-over");
    });
  });

  ["dragleave", "dragend", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-drag-over");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const file = [...(event.dataTransfer?.files || [])].find(
      (item) => item.type === "application/pdf" || item.name.toLowerCase().endsWith(".pdf")
    );

    if (!file) {
      state.error = "Upload a PDF resume to continue.";
      render();
      return;
    }

    state.selectedFile = file;
    state.result = null;
    state.error = "";
    state.screen = "upload";
    render();
  });
}

async function handleRunTailoring() {
  if (!state.selectedFile) {
    fileInput.click();
    return;
  }

  state.screen = "refactoring";
  state.error = "";
  render();

  try {
    const jobContext = await extractJobContext();
    if (!jobContext.jdText || jobContext.jdText.length < 80) {
      throw new Error("Open a job description page in the current tab before running Refactr.");
    }

    const formData = new FormData();
    formData.append("pdf", state.selectedFile);
    formData.append("jd_text", jobContext.jdText);
    formData.append("output", "json");

    const response = await fetch(`${DEFAULT_API_BASE_URL}/api/tailor/pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await readErrorResponse(response));
    }

    state.jobContext = jobContext;
    state.result = await response.json();
    state.screen = "results";
    state.error = "";
    render();
  } catch (error) {
    state.screen = "upload";
    state.error = toMessage(error);
    render();
  }
}

async function handleDownloadResume() {
  if (!state.selectedFile) {
    fileInput.click();
    return;
  }

  state.screen = "downloading";
  state.error = "";
  render();

  try {
    const jobContext = state.jobContext || (await extractJobContext());
    const formData = new FormData();
    formData.append("pdf", state.selectedFile);
    formData.append("jd_text", jobContext.jdText);
    formData.append("output", "pdf");

    const response = await fetch(`${DEFAULT_API_BASE_URL}/api/tailor/pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await readErrorResponse(response));
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);

    try {
      await chrome.downloads.download({
        url: downloadUrl,
        filename: buildDownloadName(jobContext),
        saveAs: true,
      });
    } finally {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }

    state.jobContext = jobContext;
    state.screen = "results";
    render();
  } catch (error) {
    state.screen = "results";
    state.error = toMessage(error);
    render();
  }
}

async function extractJobContext() {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!activeTab?.id) {
    throw new Error("Open a job page in a browser tab first.");
  }

  if (!activeTab.url || /^(chrome|edge|about|brave):\/\//.test(activeTab.url)) {
    throw new Error("Open a public job description page before using the extension.");
  }

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => {
      const selectors = {
        title: [
          ".job-details-jobs-unified-top-card__job-title h1",
          ".jobs-unified-top-card__job-title",
          ".top-card-layout__title",
          "[data-testid='jobsearch-JobInfoHeader-title']",
          "[data-testid='jobsearch-JobInfoHeader-title-container'] h1",
          "main h1",
          "article h1",
          "h1",
        ],
        company: [
          ".job-details-jobs-unified-top-card__company-name a",
          ".jobs-unified-top-card__company-name",
          ".topcard__org-name-link",
          "[data-testid='inlineHeader-companyName']",
          "[data-testid='company-name']",
        ],
        location: [
          ".job-details-jobs-unified-top-card__tertiary-description-container",
          ".jobs-unified-top-card__bullet",
          ".topcard__flavor--bullet",
          "[data-testid='job-location']",
          "[data-testid='inlineHeader-companyLocation']",
        ],
        description: [
          ".jobs-description__content",
          ".jobs-box__html-content",
          ".description__text",
          "[data-job-description]",
          "[data-testid='jobsearch-JobComponent-description']",
          "article",
          "main",
        ],
      };

      const clean = (value) => (value || "").replace(/\s+/g, " ").trim();

      const firstText = (candidateSelectors) => {
        for (const selector of candidateSelectors) {
          const element = document.querySelector(selector);
          const text = clean(element?.innerText || element?.textContent || "");
          if (text) {
            return text;
          }
        }
        return "";
      };

      const longestText = (candidateSelectors) => {
        let best = "";
        for (const selector of candidateSelectors) {
          const element = document.querySelector(selector);
          const text = clean(element?.innerText || element?.textContent || "");
          if (text.length > best.length) {
            best = text;
          }
        }
        return best;
      };

      const metaTitle =
        document.querySelector("meta[property='og:title']")?.getAttribute("content") ||
        document.querySelector("meta[name='title']")?.getAttribute("content") ||
        "";

      const title = firstText(selectors.title) || clean(metaTitle) || clean(document.title.split("|")[0]);
      const company = firstText(selectors.company);
      const location = firstText(selectors.location);
      const description = longestText(selectors.description) || clean(document.body?.innerText || "");

      const jdText = [title, company ? `Company: ${company}` : "", location ? `Location: ${location}` : "", description]
        .filter(Boolean)
        .join("\n\n");

      return {
        title,
        company,
        location,
        description,
        jdText,
      };
    },
  });

  if (!injection?.result) {
    throw new Error("The extension could not read the current page.");
  }

  return injection.result;
}

async function readErrorResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = await response.json().catch(() => null);
    if (payload?.detail) {
      return Array.isArray(payload.detail) ? payload.detail.join(", ") : String(payload.detail);
    }
    if (payload?.message) {
      return String(payload.message);
    }
  }

  const text = await response.text().catch(() => "");
  return text || `Request failed with status ${response.status}.`;
}

function getJobTitle() {
  return state.jobContext?.title || state.result?.job_description?.title || "Current Job Page";
}

function getJobSubtitle() {
  const pieces = [
    state.jobContext?.company || state.result?.job_description?.company || "",
    state.jobContext?.location || "",
  ].filter(Boolean);

  if (pieces.length > 0) {
    return pieces.join(", ");
  }

  return "Matched against the active browser tab";
}

function getKeywordMatches(result) {
  const compatibility = result?.compatibility || {};
  const jd = result?.job_description || {};

  const matches = uniqueCaseInsensitive([
    ...(compatibility.matched_must_have || []),
    ...(compatibility.matched_nice_to_have || []),
    ...(jd.keywords || []),
  ]);

  return matches.slice(0, 5);
}

function getMatchedCount(compatibility) {
  return uniqueCaseInsensitive([
    ...(compatibility.matched_must_have || []),
    ...(compatibility.matched_nice_to_have || []),
  ]).length;
}

function getTotalCount(jobDescription) {
  return uniqueCaseInsensitive([
    ...(jobDescription?.must_have_skills || []),
    ...(jobDescription?.nice_to_have_skills || []),
  ]).length;
}

function uniqueCaseInsensitive(values) {
  const items = [];
  const seen = new Set();

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    items.push(normalized);
  }

  return items;
}

function buildDownloadName(jobContext) {
  const title = safeSegment(jobContext?.title || "tailored-resume");
  return `refactr-${title}.pdf`;
}

function safeSegment(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "tailored-resume";
}

function truncate(value, limit) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1)}...`;
}

function toMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderSegmentLoader({ animated = false, small = false } = {}) {
  const dimmed = new Set([10, 13]);

  return `
    <div class="segment-loader ${animated ? "is-animated" : ""} ${small ? "is-small" : ""}" aria-hidden="true">
      ${Array.from({ length: 16 }, (_, index) => {
        return `
          <span class="segment ${dimmed.has(index) ? "is-dimmed" : ""}" style="--segment-index:${index}">
            <span class="segment-pill"></span>
          </span>
        `;
      }).join("")}
    </div>
  `;
}

function renderLogoIcon() {
  return `
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1.5" y="1.5" width="9" height="9" rx="1.2" stroke="currentColor" stroke-width="1.6"></rect>
      <rect x="7.5" y="7.5" width="9" height="9" rx="1.2" stroke="currentColor" stroke-width="1.6"></rect>
    </svg>
  `;
}

function renderCloseIcon() {
  return `
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
    </svg>
  `;
}

function renderDocumentIcon({ size }) {
  return `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7 3.5H13L18 8.5V20.5C18 21.0523 17.5523 21.5 17 21.5H7C6.44772 21.5 6 21.0523 6 20.5V4.5C6 3.94772 6.44772 3.5 7 3.5Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"></path>
      <path d="M13 3.5V8.5H18" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"></path>
    </svg>
  `;
}

function renderUploadIcon({ size }) {
  return `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 15.5V4.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path>
      <path d="M7.5 9L12 4.5L16.5 9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M5 15.5V18.5C5 19.6046 5.89543 20.5 7 20.5H17C18.1046 20.5 19 19.6046 19 18.5V15.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path>
    </svg>
  `;
}

function renderDownloadIcon({ size }) {
  return `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 4.5V15.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path>
      <path d="M7.5 11L12 15.5L16.5 11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M5 19.5V18.5C5 17.3954 5.89543 16.5 7 16.5H17C18.1046 16.5 19 17.3954 19 18.5V19.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path>
    </svg>
  `;
}

function renderInfoIcon() {
  return `
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.4"></circle>
      <path d="M9 7.1V11.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path>
      <circle cx="9" cy="4.9" r="0.9" fill="currentColor"></circle>
    </svg>
  `;
}

function renderChipCheckIcon() {
  return `
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3.5 7.25L5.85 9.5L10.5 4.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
}
