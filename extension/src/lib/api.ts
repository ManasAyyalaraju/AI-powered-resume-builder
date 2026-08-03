import { API_BASE_URL } from './config';

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
  const formData = new FormData();
  formData.append('pdf', pdfBlob, fileName);
  formData.append('jd_text', jobDescription);
  formData.append('output', 'pdf');
  formData.append('resume_format', resumeFormat);

  const response = await fetch(`${API_BASE_URL}/api/tailor/pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Tailoring failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return response.blob();
}
