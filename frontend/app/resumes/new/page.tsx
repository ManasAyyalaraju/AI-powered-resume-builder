'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FilePlus2, FileText, Code2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { uploadBaseResume } from '@/lib/supabase/resumes';
import { reformatResume, fetchTemplatePreview, ResumeFormat } from '@/lib/api';

export default function NewResumePage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeFormat, setResumeFormat] = useState<ResumeFormat>('regular');
  const [previewUrls, setPreviewUrls] = useState<Record<ResumeFormat, string>>({ regular: '', technical: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let regularUrl = '';
    let technicalUrl = '';

    Promise.all([fetchTemplatePreview('regular'), fetchTemplatePreview('technical')])
      .then(([regularBlob, technicalBlob]) => {
        regularUrl = URL.createObjectURL(regularBlob);
        technicalUrl = URL.createObjectURL(technicalBlob);
        setPreviewUrls({ regular: regularUrl, technical: technicalUrl });
      })
      .catch((err) => console.error('Failed to load template previews:', err));

    return () => {
      if (regularUrl) URL.revokeObjectURL(regularUrl);
      if (technicalUrl) URL.revokeObjectURL(technicalUrl);
    };
  }, []);

  const handleSave = async () => {
    if (!selectedFile || !user) return;

    setIsSaving(true);
    setError('');

    const pdfResponse = await reformatResume({
      pdfFile: selectedFile,
      fileName: selectedFile.name,
      resumeFormat,
    });

    if (!pdfResponse.success || !pdfResponse.data) {
      setError(pdfResponse.error || 'Failed to reformat your resume. Please try again.');
      setIsSaving(false);
      return;
    }

    const reformattedFile = new File([pdfResponse.data], selectedFile.name, { type: 'application/pdf' });
    const result = await uploadBaseResume(supabase, user.id, reformattedFile);

    if (!result) {
      setError('Failed to save your resume. Please try again.');
      setIsSaving(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <FilePlus2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a resume</h1>
              <p className="text-gray-600">
                Upload a PDF and we&apos;ll reformat it into a clean, ATS-friendly resume saved to your account.
              </p>
            </div>

            {error && (
              <div className="mb-6">
                <ErrorMessage message={error} onRetry={() => setError('')} />
              </div>
            )}

            {isSaving ? (
              <LoadingSpinner message="Reformatting your resume..." submessage="This usually finishes in under a minute." />
            ) : (
              <FileUpload selectedFile={selectedFile} onFileSelect={setSelectedFile} />
            )}
          </div>

          {!isSaving && (
            <>
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Choose a Template</h2>
                  <p className="text-gray-600">Pick how your resume should be formatted</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setResumeFormat('regular')}
                    className={`flex items-start gap-3 text-left p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      resumeFormat === 'regular'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className={`w-6 h-6 flex-shrink-0 ${resumeFormat === 'regular' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-800">Regular</p>
                      <p className="text-sm text-gray-600">
                        Classic single-line skills format. Best for most roles.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResumeFormat('technical')}
                    className={`flex items-start gap-3 text-left p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      resumeFormat === 'technical'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Code2 className={`w-6 h-6 flex-shrink-0 ${resumeFormat === 'technical' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-800">Technical</p>
                      <p className="text-sm text-gray-600">
                        Adds a categorized Technical Skills section. Best for engineering/technical roles.
                      </p>
                    </div>
                  </button>
                </div>

                {previewUrls[resumeFormat] ? (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Sample {resumeFormat === 'regular' ? 'Regular' : 'Technical'} resume
                    </p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={`${previewUrls[resumeFormat]}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                        className="w-full h-[500px] border-0"
                        title={`${resumeFormat} template sample`}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-gray-500">Loading sample previews...</p>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={handleSave}
                  disabled={!selectedFile || isSaving}
                  className={`
                    inline-flex items-center justify-center gap-3
                    px-10 py-4 rounded-xl font-semibold text-lg
                    shadow-lg hover:shadow-xl
                    transition-all duration-200
                    ${selectedFile && !isSaving
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Save Resume
                </button>
                {!selectedFile && (
                  <p className="mt-4 text-sm text-gray-500">Please upload a resume above</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
