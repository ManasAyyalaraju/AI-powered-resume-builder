/**
 * Job-board detection and job-description extraction.
 *
 * Site DOM structures change often and aren't publicly versioned, so these
 * selectors are best-effort with fallbacks, tuned most carefully for
 * LinkedIn. Non-LinkedIn boards fall back to a generic heuristic when their
 * specific selectors don't match.
 */

export interface JobContext {
  title: string | null;
  company: string | null;
  description: string;
}

type Site = 'linkedin' | 'indeed' | 'glassdoor' | 'handshake' | 'unknown';

function detectSite(url: string): Site {
  const { hostname } = new URL(url);

  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('indeed.com')) return 'indeed';
  if (hostname.includes('glassdoor.com')) return 'glassdoor';
  if (hostname.includes('joinhandshake.com')) return 'handshake';
  return 'unknown';
}

/** Decides whether the current page looks like a single job posting worth auto-showing the panel on. */
export function isJobPostingUrl(url: string): boolean {
  const { hostname, pathname, search } = new URL(url);

  if (hostname.includes('linkedin.com')) {
    return pathname.startsWith('/jobs/view/') || pathname.includes('/jobs/collections/');
  }
  if (hostname.includes('indeed.com')) {
    return pathname.includes('/viewjob') || search.includes('vjk=');
  }
  if (hostname.includes('glassdoor.com')) {
    return pathname.toLowerCase().includes('job-listing');
  }
  if (hostname.includes('joinhandshake.com')) {
    return pathname.includes('/postings/');
  }
  return false;
}

function firstMatchText(selectors: string[]): string | null {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const text = el?.textContent?.trim();
    if (text) return text;
  }
  return null;
}

function extractLinkedIn(): JobContext {
  const description = firstMatchText([
    '.jobs-description__content',
    '.jobs-box__html-content',
    '#job-details',
    '.jobs-description-content__text',
  ]);
  const title = firstMatchText([
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    'h1',
  ]);
  const company = firstMatchText([
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__subtitle-primary-grouping a',
  ]);

  return { title, company, description: description ?? '' };
}

function extractIndeed(): JobContext {
  const description = firstMatchText(['#jobDescriptionText']);
  const title = firstMatchText([
    '[data-testid="jobsearch-JobInfoHeader-title"]',
    '.jobsearch-JobInfoHeader-title',
  ]);
  const company = firstMatchText([
    '[data-testid="inlineHeader-companyName"]',
    '.jobsearch-InlineCompanyRating div',
  ]);

  return { title, company, description: description ?? '' };
}

function extractGlassdoor(): JobContext {
  const description = firstMatchText(['[class*="JobDetails_jobDescription"]']);
  const title = firstMatchText(['[class*="JobDetails_jobTitle"]', 'h1']);
  const company = firstMatchText(['[class*="EmployerProfile_employerName"]']);

  return { title, company, description: description ?? '' };
}

function extractHandshake(): JobContext {
  const description = firstMatchText(['[class*="job-description"]', '[class*="description-container"]']);
  const title = firstMatchText(['h1']);
  const company = firstMatchText(['[class*="employer-name"]', 'a[href*="/employers/"]']);

  return { title, company, description: description ?? '' };
}

/** Best-effort fallback for boards without a dedicated extractor: the largest "description"-like text block on the page. */
function extractGeneric(): JobContext {
  const candidates = Array.from(
    document.querySelectorAll('[class*="description" i], [id*="description" i], main, article')
  );

  let best: Element | null = null;
  let bestLength = 0;
  for (const el of candidates) {
    const length = el.textContent?.trim().length ?? 0;
    if (length > bestLength) {
      best = el;
      bestLength = length;
    }
  }

  const title = document.querySelector('h1')?.textContent?.trim() || document.title || null;

  return {
    title,
    company: null,
    description: best?.textContent?.trim() ?? '',
  };
}

export function extractJobContext(url: string = window.location.href): JobContext | null {
  const site = detectSite(url);

  const context =
    site === 'linkedin'
      ? extractLinkedIn()
      : site === 'indeed'
        ? extractIndeed()
        : site === 'glassdoor'
          ? extractGlassdoor()
          : site === 'handshake'
            ? extractHandshake()
            : extractGeneric();

  if (!context.description || context.description.length < 100) {
    // Not enough signal to be confident this is a real job description yet
    // (page may still be loading, or extraction missed).
    const fallback = extractGeneric();
    if (fallback.description.length > context.description.length) {
      return fallback;
    }
  }

  return context.description ? context : null;
}
