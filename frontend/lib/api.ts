import axios from 'axios';
import { Resume } from '@/types/resume';

// Configure the base URL for the backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface TailorResumeParams {
  pdfFile: File;
  jobDescription: string;
  outputFormat?: 'json' | 'pdf';
}

export interface TailorResumeResponse {
  data: Resume | Blob;
  success: boolean;
  error?: string;
}

export interface ReformatResumeParams {
  pdfFile: File;
}

export interface ReformatResumeResponse {
  data: Blob;
  success: boolean;
  error?: string;
}

/**
 * Tailor a resume based on a job description
 */
export async function tailorResume({
  pdfFile,
  jobDescription,
  outputFormat = 'json',
}: TailorResumeParams): Promise<TailorResumeResponse> {
  try {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('jd_text', jobDescription);
    formData.append('output', outputFormat);

    const response = await apiClient.post('/api/tailor/pdf', formData, {
      responseType: outputFormat === 'pdf' ? 'blob' : 'json',
    });

    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    console.error('Error tailoring resume:', error);
    return {
      data: {} as Resume,
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

/**
 * Reformat a resume into an ATS-friendly PDF without tailoring to a job description
 */
export async function reformatResume({
  pdfFile,
}: ReformatResumeParams): Promise<ReformatResumeResponse> {
  try {
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    const response = await apiClient.post('/api/reformat/pdf', formData, {
      responseType: 'blob',
    });

    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    console.error('Error reformatting resume:', error);
    return {
      data: new Blob(),
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

/**
 * Download a PDF blob as a file
 */
export function downloadPDF(blob: Blob, filename: string = 'tailored_resume.pdf') {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Check if the backend API is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
