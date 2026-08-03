import { isJobPostingUrl, extractJobContext, type JobContext } from './lib/extract-jd';
import { mountPanelApp } from './panel-app';

let currentUrl = '';
let hostEl: HTMLElement | null = null;
let dismissedForThisPage = false;

function teardown() {
  hostEl?.remove();
  hostEl = null;
}

async function tryShowPrompt(attempt = 0) {
  if (dismissedForThisPage || hostEl) return;

  const jobContext = extractJobContext();

  if (!jobContext && attempt < 4) {
    // LinkedIn and similar SPAs render the description asynchronously.
    setTimeout(() => tryShowPrompt(attempt + 1), 1000);
    return;
  }

  if (!jobContext) return;

  await renderPrompt(jobContext);
}

async function renderPrompt(jobContext: JobContext) {
  hostEl = document.createElement('div');
  hostEl.id = 'refactr-host';
  hostEl.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;';
  document.documentElement.appendChild(hostEl);

  const shadow = hostEl.attachShadow({ mode: 'open' });

  const cssText = await fetch(chrome.runtime.getURL('panel.css')).then((r) => r.text());
  const style = document.createElement('style');
  style.textContent = cssText;
  shadow.appendChild(style);

  const promptEl = document.createElement('div');
  promptEl.className = 'refactr-panel';
  promptEl.innerHTML = `
    <div class="refactr-prompt">
      <p>Tailor your resume for this job?</p>
    </div>
    <div class="refactr-body" style="padding-top:0;">
      <button type="button" class="refactr-btn" data-action="open">Open refactr</button>
      <button type="button" class="refactr-btn refactr-btn-secondary" style="margin-top:8px;" data-action="dismiss">Not now</button>
    </div>
  `;
  shadow.appendChild(promptEl);

  promptEl.querySelector('[data-action="dismiss"]')?.addEventListener('click', () => {
    dismissedForThisPage = true;
    teardown();
  });

  promptEl.querySelector('[data-action="open"]')?.addEventListener('click', () => {
    shadow.removeChild(promptEl);
    const panelContainer = document.createElement('div');
    shadow.appendChild(panelContainer);
    mountPanelApp({
      container: panelContainer,
      jobContext,
      onClose: () => {
        dismissedForThisPage = true;
        teardown();
      },
    });
  });
}

function checkForNavigation() {
  if (window.location.href === currentUrl) return;
  currentUrl = window.location.href;
  dismissedForThisPage = false;
  teardown();

  if (isJobPostingUrl(currentUrl)) {
    tryShowPrompt();
  }
}

// Initial load
currentUrl = window.location.href;
if (isJobPostingUrl(currentUrl)) {
  tryShowPrompt();
}

// LinkedIn and similar boards are SPAs - URL changes without a full reload.
setInterval(checkForNavigation, 1500);
