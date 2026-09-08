"use strict";
(() => {
  // src/lib/extract-jd.ts
  function detectSite(url) {
    const { hostname } = new URL(url);
    if (hostname.includes("linkedin.com")) return "linkedin";
    if (hostname.includes("indeed.com")) return "indeed";
    if (hostname.includes("glassdoor.com")) return "glassdoor";
    if (hostname.includes("joinhandshake.com")) return "handshake";
    return "unknown";
  }
  function firstMatchText(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text) return text;
    }
    return null;
  }
  function extractLinkedIn() {
    const description = firstMatchText([
      // LinkedIn's newer "SDUI" (server-driven UI) markup tags this section
      // with a semantic data attribute rather than a class name - the class
      // names below it are auto-generated per-deploy and go stale quickly
      // (confirmed: all four previously matched nothing on current LinkedIn).
      // Prefer the semantic attribute; keep the old selectors as fallbacks in
      // case LinkedIn serves a different variant.
      '[data-sdui-component*="aboutTheJob"]',
      ".jobs-description__content",
      ".jobs-box__html-content",
      "#job-details",
      ".jobs-description-content__text"
    ]);
    const title = firstMatchText([
      ".job-details-jobs-unified-top-card__job-title",
      ".jobs-unified-top-card__job-title",
      "h1"
    ]);
    const company = firstMatchText([
      ".job-details-jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__company-name",
      ".jobs-unified-top-card__subtitle-primary-grouping a"
    ]);
    return { title, company, description: description ?? "" };
  }
  function extractIndeed() {
    const description = firstMatchText(["#jobDescriptionText"]);
    const title = firstMatchText([
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      ".jobsearch-JobInfoHeader-title"
    ]);
    const company = firstMatchText([
      '[data-testid="inlineHeader-companyName"]',
      ".jobsearch-InlineCompanyRating div"
    ]);
    return { title, company, description: description ?? "" };
  }
  function extractGlassdoor() {
    const description = firstMatchText(['[class*="JobDetails_jobDescription"]']);
    const title = firstMatchText(['[class*="JobDetails_jobTitle"]', "h1"]);
    const company = firstMatchText(['[class*="EmployerProfile_employerName"]']);
    return { title, company, description: description ?? "" };
  }
  function extractHandshake() {
    const description = firstMatchText(['[class*="job-description"]', '[class*="description-container"]']);
    const title = firstMatchText(["h1"]);
    const company = firstMatchText(['[class*="employer-name"]', 'a[href*="/employers/"]']);
    return { title, company, description: description ?? "" };
  }
  function extractGeneric() {
    const candidates = Array.from(
      document.querySelectorAll('[class*="description" i], [id*="description" i], main, article')
    );
    let best = null;
    let bestLength = 0;
    for (const el of candidates) {
      const length = el.textContent?.trim().length ?? 0;
      if (length > bestLength) {
        best = el;
        bestLength = length;
      }
    }
    const title = document.querySelector("h1")?.textContent?.trim() || document.title || null;
    return {
      title,
      company: null,
      description: best?.textContent?.trim() ?? ""
    };
  }
  function extractJobContext(url = window.location.href, options = {}) {
    const { allowGenericFallback = true } = options;
    const site = detectSite(url);
    if (site === "unknown") {
      const generic = extractGeneric();
      return generic.description ? generic : null;
    }
    const context = site === "linkedin" ? extractLinkedIn() : site === "indeed" ? extractIndeed() : site === "glassdoor" ? extractGlassdoor() : extractHandshake();
    if (context.description && context.description.length >= 100) {
      return context;
    }
    if (!allowGenericFallback) {
      return null;
    }
    const fallback = extractGeneric();
    const best = fallback.description.length > (context.description?.length ?? 0) ? fallback : context;
    return best.description ? best : null;
  }

  // src/extract-injectable.ts
  window.__refactrJobContext = extractJobContext();
})();
//# sourceMappingURL=extract-injectable.js.map
