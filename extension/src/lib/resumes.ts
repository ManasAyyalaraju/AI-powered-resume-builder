import type { SupabaseClient } from '@supabase/supabase-js';

export interface BaseResumeRow {
  id: string;
  title: string;
  storage_path: string;
  file_name: string | null;
  created_at: string;
}

function randomId(): string {
  return crypto.randomUUID();
}

export async function listBaseResumes(
  supabase: SupabaseClient,
  userId: string
): Promise<BaseResumeRow[]> {
  const { data, error } = await supabase
    .from('base_resumes')
    .select('id, title, storage_path, file_name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listBaseResumes failed:', error);
    return [];
  }

  return data ?? [];
}

export async function downloadBaseResume(
  supabase: SupabaseClient,
  storagePath: string
): Promise<Blob | null> {
  const { data, error } = await supabase.storage.from('base-resumes').download(storagePath);
  if (error) {
    console.error('downloadBaseResume failed:', error);
    return null;
  }
  return data;
}

export async function uploadGeneratedResume(
  supabase: SupabaseClient,
  userId: string,
  params: {
    baseResumeId: string | null;
    pdfBlob: Blob;
    jobTitle?: string | null;
    company?: string | null;
    jobUrl?: string | null;
    jobDescription?: string | null;
    resumeFormat: 'regular' | 'technical';
  }
): Promise<void> {
  try {
    const storagePath = `${userId}/${randomId()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('generated-resumes')
      .upload(storagePath, params.pdfBlob, { contentType: 'application/pdf' });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase.from('generated_resumes').insert({
      user_id: userId,
      base_resume_id: params.baseResumeId,
      job_title: params.jobTitle ?? null,
      company: params.company ?? null,
      job_url: params.jobUrl ?? null,
      job_description_snapshot: params.jobDescription ?? null,
      tailoring_options: { mode: 'tailor', resume_format: params.resumeFormat, source: 'extension' },
      pdf_storage_path: storagePath,
    });
    if (insertError) throw insertError;
  } catch (err) {
    console.error('uploadGeneratedResume failed:', err);
  }
}
