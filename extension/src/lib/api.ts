import { blobToDataUrl } from './data-url';

export interface TailorRequest {
  pdfBlob: Blob;
  fileName: string;
  jobDescription: string;
  resumeFormat: 'regular' | 'technical';
}

export async function tailorResumePdf({
  pdfBlob,
  fileName,
  jobDescription,
  resumeFormat,
}: TailorRequest): Promise<Blob> {
  // Routed through the background service worker - a direct fetch() here
  // would run in the host page's execution context and get silently blocked
  // by that page's CSP connect-src (see background.ts for details).
  const pdfDataUrl = await blobToDataUrl(pdfBlob);

  const response = await chrome.runtime.sendMessage({
    type: 'TAILOR_RESUME',
    pdfDataUrl,
    fileName,
    jobDescription,
    resumeFormat,
  });

  if (!response?.ok) {
    throw new Error(response?.error || 'Tailoring failed.');
  }

  return fetch(response.pdfDataUrl).then((r) => r.blob());
}
