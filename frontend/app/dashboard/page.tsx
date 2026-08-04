'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { listBaseResumes, downloadBaseResume, BaseResumeRow } from '@/lib/supabase/resumes';
import { downloadPDF } from '@/lib/api';
import { FilePlus2, FileText, Wand2, Download } from 'lucide-react';

export default function DashboardPage() {
  const { user, displayName } = useAuth();
  const supabase = createClient();
  const [resumes, setResumes] = useState<BaseResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    listBaseResumes(supabase, user.id).then((rows) => {
      setResumes(rows);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const currentResume = resumes[0] ?? null;
  const olderResumes = resumes.slice(1);

  const handleDownloadCurrent = async () => {
    if (!currentPreviewUrl || !currentResume) return;
    const blob = await fetch(currentPreviewUrl).then((res) => res.blob());
    downloadPDF(blob, currentResume.file_name ?? currentResume.title);
  };

  useEffect(() => {
    if (!currentResume) return;

    let objectUrl = '';
    setPreviewLoading(true);

    downloadBaseResume(supabase, currentResume.storage_path).then((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setCurrentPreviewUrl(objectUrl);
      }
      setPreviewLoading(false);
    });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResume?.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{displayName ? `, ${displayName}` : ''}
          </h1>
          <p className="text-gray-600 mb-10">{user?.email}</p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: current resume + history */}
            <div className="lg:col-span-2">
              <Link
                href="/resumes/new"
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 mb-8"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FilePlus2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add a resume</h2>
                  <p className="text-sm text-gray-600">Upload a resume to save it to your account.</p>
                </div>
              </Link>

              {!loading && !currentResume ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center mb-8">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Your current resume will show up here once you add one.
                  </p>
                </div>
              ) : currentResume ? (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{currentResume.title}</p>
                      <p className="text-xs text-gray-500">
                        Saved {new Date(currentResume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <button
                        onClick={handleDownloadCurrent}
                        disabled={!currentPreviewUrl}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <Link
                        href={`/tailor?resumeId=${currentResume.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        <Wand2 className="w-4 h-4" />
                        Tailor
                      </Link>
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    {previewLoading ? (
                      <div className="py-12">
                        <LoadingSpinner message="Loading your resume..." />
                      </div>
                    ) : currentPreviewUrl ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <iframe
                          src={`${currentPreviewUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                          className="w-full h-[800px] border-0"
                          title="Current resume preview"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-12">Couldn&apos;t load a preview.</p>
                    )}
                  </div>
                </div>
              ) : null}

              {olderResumes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Older resumes
                  </h3>
                  <div className="space-y-3">
                    {olderResumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{resume.title}</p>
                          <p className="text-xs text-gray-500">
                            Saved {new Date(resume.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={`/tailor?resumeId=${resume.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 flex-shrink-0"
                        >
                          <Wand2 className="w-4 h-4" />
                          Tailor
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: reserved for later */}
            <div className="lg:col-span-1" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
