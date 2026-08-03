'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { listBaseResumes, BaseResumeRow } from '@/lib/supabase/resumes';
import { FilePlus2, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user, displayName } = useAuth();
  const supabase = createClient();
  const [resumes, setResumes] = useState<BaseResumeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listBaseResumes(supabase, user.id).then((rows) => {
      setResumes(rows);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{displayName ? `, ${displayName}` : ''}
          </h1>
          <p className="text-gray-600 mb-10">{user?.email}</p>

          <Link
            href="/tailor"
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 mb-8"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FilePlus2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Start tailoring a resume</h2>
              <p className="text-sm text-gray-600">Upload a resume and a job description to get a tailored draft.</p>
            </div>
          </Link>

          {!loading && resumes.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Your saved resumes will show up here once you tailor or reformat one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{resume.title}</p>
                    <p className="text-xs text-gray-500">
                      Saved {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
