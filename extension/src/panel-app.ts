import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './lib/supabase-client';
import { listBaseResumes, downloadBaseResume, uploadGeneratedResume, type BaseResumeRow } from './lib/resumes';
import { tailorResumePdf } from './lib/api';
import type { JobContext } from './lib/extract-jd';

type Screen = 'loading' | 'login' | 'picker' | 'tailoring' | 'done' | 'error';

export interface PanelAppOptions {
  container: HTMLElement;
  jobContext: JobContext | null;
  onClose?: () => void;
}

interface State {
  screen: Screen;
  user: User | null;
  resumes: BaseResumeRow[];
  selectedResumeId: string | null;
  resumeFormat: 'regular' | 'technical';
  errorMessage: string;
  loginEmail: string;
  loginError: string;
  loginBusy: boolean;
}

export function mountPanelApp({ container, jobContext, onClose }: PanelAppOptions): void {
  const supabase = getSupabaseClient();

  const state: State = {
    screen: 'loading',
    user: null,
    resumes: [],
    selectedResumeId: null,
    resumeFormat: 'regular',
    errorMessage: '',
    loginEmail: '',
    loginError: '',
    loginBusy: false,
  };

  function render() {
    container.innerHTML = `
      <div class="refactr-panel">
        ${renderHeader()}
        <div class="refactr-body">${renderBody()}</div>
      </div>
    `;
    bindEvents();
  }

  function renderHeader(): string {
    return `
      <div class="refactr-header">
        <div class="refactr-brand">refactr</div>
        ${onClose ? '<button type="button" class="refactr-close" data-action="close">&times;</button>' : ''}
      </div>
    `;
  }

  function renderBody(): string {
    switch (state.screen) {
      case 'loading':
        return `<div class="refactr-status"><div class="refactr-spinner"></div><p>Loading...</p></div>`;
      case 'login':
        return renderLogin();
      case 'picker':
        return renderPicker();
      case 'tailoring':
        return `<div class="refactr-status"><div class="refactr-spinner"></div><p>Tailoring your resume...</p></div>`;
      case 'done':
        return `<div class="refactr-status"><p>&#10003; Tailored resume downloaded.</p><button type="button" class="refactr-btn" data-action="reset">Tailor another</button></div>`;
      case 'error':
        return `
          <div class="refactr-status">
            <p class="refactr-error">${escapeHtml(state.errorMessage)}</p>
            <button type="button" class="refactr-btn" data-action="reset">Try again</button>
          </div>
        `;
    }
  }

  function renderLogin(): string {
    return `
      ${state.loginError ? `<p class="refactr-error">${escapeHtml(state.loginError)}</p>` : ''}
      <div class="refactr-field">
        <label for="refactr-email">Email</label>
        <input id="refactr-email" type="email" value="${escapeHtml(state.loginEmail)}" placeholder="you@example.com" />
      </div>
      <div class="refactr-field">
        <label for="refactr-password">Password</label>
        <input id="refactr-password" type="password" placeholder="••••••••" />
      </div>
      <button type="button" class="refactr-btn" data-action="login" ${state.loginBusy ? 'disabled' : ''}>
        ${state.loginBusy ? 'Logging in...' : 'Log in'}
      </button>
    `;
  }

  function renderPicker(): string {
    const jobMeta = jobContext
      ? `
        <div class="refactr-job-meta">
          ${jobContext.title ? `<p class="refactr-job-title">${escapeHtml(jobContext.title)}</p>` : ''}
          ${jobContext.company ? `<p>${escapeHtml(jobContext.company)}</p>` : ''}
        </div>
      `
      : '';

    if (state.resumes.length === 0) {
      return `
        ${jobMeta}
        <div class="refactr-empty">
          No saved resumes yet. Tailor or reformat a resume once on the refactr web app to save one here.
        </div>
      `;
    }

    const options = state.resumes
      .map(
        (r) =>
          `<option value="${r.id}" ${r.id === state.selectedResumeId ? 'selected' : ''}>${escapeHtml(r.title)}</option>`
      )
      .join('');

    return `
      ${jobMeta}
      <div class="refactr-field">
        <label for="refactr-resume">Resume</label>
        <select id="refactr-resume">${options}</select>
      </div>
      <div class="refactr-field">
        <label>Template</label>
        <div class="refactr-format-options">
          <div class="refactr-format-option ${state.resumeFormat === 'regular' ? 'selected' : ''}" data-format="regular">Regular</div>
          <div class="refactr-format-option ${state.resumeFormat === 'technical' ? 'selected' : ''}" data-format="technical">Technical</div>
        </div>
      </div>
      <button type="button" class="refactr-btn" data-action="tailor" ${!jobContext ? 'disabled' : ''}>
        Tailor &amp; Download
      </button>
      ${!jobContext ? '<p class="refactr-error" style="margin-top:8px;">Could not read a job description on this page.</p>' : ''}
    `;
  }

  function bindEvents() {
    container.querySelector('[data-action="close"]')?.addEventListener('click', () => onClose?.());
    container.querySelector('[data-action="login"]')?.addEventListener('click', handleLogin);
    container.querySelector('[data-action="tailor"]')?.addEventListener('click', handleTailor);
    container.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      state.screen = 'picker';
      render();
    });
    container.querySelectorAll('[data-format]').forEach((el) => {
      el.addEventListener('click', () => {
        state.resumeFormat = (el as HTMLElement).dataset.format as 'regular' | 'technical';
        render();
      });
    });
    container.querySelector('#refactr-resume')?.addEventListener('change', (e) => {
      state.selectedResumeId = (e.target as HTMLSelectElement).value;
    });
  }

  async function handleLogin() {
    const email = (container.querySelector('#refactr-email') as HTMLInputElement)?.value ?? '';
    const password = (container.querySelector('#refactr-password') as HTMLInputElement)?.value ?? '';
    state.loginEmail = email;
    state.loginError = '';

    if (!email || !password) {
      state.loginError = 'Enter your email and password.';
      render();
      return;
    }

    state.loginBusy = true;
    render();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    state.loginBusy = false;

    if (error || !data.user) {
      state.loginError = error?.message ?? 'Login failed.';
      render();
      return;
    }

    state.user = data.user;
    await loadResumes();
  }

  async function loadResumes() {
    if (!state.user) return;
    state.resumes = await listBaseResumes(supabase, state.user.id);
    state.selectedResumeId = state.resumes[0]?.id ?? null;
    state.screen = 'picker';
    render();
  }

  async function handleTailor() {
    if (!state.user || !jobContext || !state.selectedResumeId) return;

    const resume = state.resumes.find((r) => r.id === state.selectedResumeId);
    if (!resume) return;

    state.screen = 'tailoring';
    render();

    try {
      const pdfBlob = await downloadBaseResume(supabase, resume.storage_path);
      if (!pdfBlob) throw new Error('Could not load that saved resume file.');

      const tailoredBlob = await tailorResumePdf({
        pdfBlob,
        fileName: resume.file_name ?? resume.title,
        jobDescription: jobContext.description,
        resumeFormat: state.resumeFormat,
      });

      await downloadBlob(tailoredBlob, 'tailored_resume.pdf');

      uploadGeneratedResume(supabase, state.user.id, {
        baseResumeId: resume.id,
        pdfBlob: tailoredBlob,
        jobTitle: jobContext.title,
        company: jobContext.company,
        jobUrl: window.location?.href,
        jobDescription: jobContext.description,
        resumeFormat: state.resumeFormat,
      });

      state.screen = 'done';
      render();
    } catch (err) {
      state.errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
      state.screen = 'error';
      render();
    }
  }

  async function downloadBlob(blob: Blob, filename: string): Promise<void> {
    // Content scripts can't call chrome.downloads directly, and blob: URLs
    // don't resolve across contexts - so we hand the background service
    // worker a data: URL (a plain string) it can pass to chrome.downloads.
    const dataUrl = await blobToDataUrl(blob);
    await chrome.runtime.sendMessage({ type: 'DOWNLOAD_FILE', url: dataUrl, filename });
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initial load
  render();
  supabase.auth.getUser().then(async ({ data }) => {
    if (data.user) {
      state.user = data.user;
      await loadResumes();
    } else {
      state.screen = 'login';
      render();
    }
  });
}
