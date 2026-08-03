import { mountPanelApp } from './panel-app';
import type { JobContext } from './lib/extract-jd';

async function getJobContextFromActiveTab(): Promise<JobContext | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) return null;

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['extract-injectable.js'] });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (window as unknown as { __refactrJobContext: JobContext | null }).__refactrJobContext,
    });
    return results[0]?.result ?? null;
  } catch (err) {
    console.warn('refactr: could not read this page.', err);
    return null;
  }
}

async function init() {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = '<div class="refactr-panel"><div class="refactr-status"><div class="refactr-spinner"></div></div></div>';

  const jobContext = await getJobContextFromActiveTab();

  mountPanelApp({ container, jobContext });
}

init();
