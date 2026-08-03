import type { SupabaseClient } from '@supabase/supabase-js';

export interface BaseResumeRow {
  id: string;
  user_id: string;
  title: string;
  storage_path: string;
  file_name: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TailoringOptions {
  mode: 'tailor' | 'reformat';
  score?: number;
  resume_format?: 'regular' | 'technical';
}

function randomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export async function uploadBaseResume(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ id: string; storage_path: string } | null> {
  try {
    const storagePath = `${userId}/${randomId()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('base-resumes')
      .upload(storagePath, file, { contentType: file.type || 'application/pdf' });

    if (uploadError) throw uploadError;

    const { data, error: insertError } = await supabase
      .from('base_resumes')
      .insert({
        user_id: userId,
        title: file.name,
        storage_path: storagePath,
        file_name: file.name,
      })
      .select('id, storage_path')
      .single();

    if (insertError) throw insertError;

    return data;
  } catch (err) {
    console.error('uploadBaseResume failed:', err);
    return null;
  }
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
    tailoringOptions: TailoringOptions;
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
      tailoring_options: params.tailoringOptions,
      pdf_storage_path: storagePath,
    });

    if (insertError) throw insertError;
  } catch (err) {
    console.error('uploadGeneratedResume failed:', err);
  }
}

export async function listBaseResumes(
  supabase: SupabaseClient,
  userId: string
): Promise<BaseResumeRow[]> {
  const { data, error } = await supabase
    .from('base_resumes')
    .select('*')
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
