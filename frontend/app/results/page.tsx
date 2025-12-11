'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Download, FileJson, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { TailoredResult, CompatibilityReport, JobDescription } from '@/types/resume';

const normalizeSkill = (skill: string) => skill.trim().toLowerCase();

const computeCompatibility = (
  resumeSkills: string[],
  jd?: JobDescription
): CompatibilityReport => {
  const must = jd?.must_have_skills || [];
  const nice = jd?.nice_to_have_skills || [];

  const resumeMap = new Map(resumeSkills.map((s) => [normalizeSkill(s), s]));
  const mustMap = new Map(must.map((s) => [normalizeSkill(s), s]));
  const niceMap = new Map(nice.map((s) => [normalizeSkill(s), s]));

  const resumeKeys = new Set(resumeMap.keys());

  const matchedMust = Array.from(mustMap.entries())
    .filter(([key]) => resumeKeys.has(key))
    .map(([, value]) => value);
  const matchedNice = Array.from(niceMap.entries())
    .filter(([key]) => resumeKeys.has(key))
    .map(([, value]) => value);
  const missingMust = Array.from(mustMap.entries())
    .filter(([key]) => !resumeKeys.has(key))
    .map(([, value]) => value);
  const missingNice = Array.from(niceMap.entries())
    .filter(([key]) => !resumeKeys.has(key))
    .map(([, value]) => value);

  const totalMust = mustMap.size;
  const totalNice = niceMap.size;

  const mustCoverage = totalMust ? matchedMust.length / totalMust : 0;
  const niceCoverage = totalNice ? matchedNice.length / totalNice : 0;

  let rawScore: number;
  if (totalMust === 0) {
    rawScore = 100 * niceCoverage;
  } else if (totalNice === 0) {
    // When there are no nice-to-haves, score purely on must-have coverage
    rawScore = 100 * mustCoverage;
  } else {
    rawScore = 100 * (0.7 * mustCoverage + 0.3 * niceCoverage);
  }

  // Raise cap when must-haves are missing (previously 60)
  if (totalMust > 0 && missingMust.length > 0) {
    rawScore = Math.min(rawScore, 80);
  }

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  const resumeSkillHits = resumeSkills.filter((s) => {
    const key = normalizeSkill(s);
    return mustMap.has(key) || niceMap.has(key);
  });

  return {
    score,
    must_coverage: mustCoverage,
    nice_coverage: niceCoverage,
    matched_must_have: matchedMust,
    matched_nice_to_have: matchedNice,
    missing_must_have: missingMust,
    missing_nice_to_have: missingNice,
    resume_skill_hits: resumeSkillHits,
  };
};

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<TailoredResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('tailoredResult') || sessionStorage.getItem('tailoredResume');
    const storedPdfUrl = sessionStorage.getItem('pdfBlobUrl');

    if (!storedResult) {
      router.push('/tailor');
      return;
    }

    try {
      const parsed = JSON.parse(storedResult);
      const normalized: TailoredResult = parsed.resume ? parsed : { resume: parsed };
      setResult(normalized);
      setPdfUrl(storedPdfUrl || '');
    } catch (error) {
      console.error('Error parsing tailored result:', error);
      router.push('/tailor');
    }
  }, [router]);

  const compatibility = useMemo(() => {
    if (!result?.resume) return null;
    if (result.compatibility) return result.compatibility;
    return computeCompatibility(result.resume.skills || [], result.job_description);
  }, [result]);

  const resumeSkills = result?.resume?.skills || [];
  const jdMust = result?.job_description?.must_have_skills || [];
  const jdNice = result?.job_description?.nice_to_have_skills || [];

  const matchedResumeSkillSet = new Set(compatibility?.resume_skill_hits || []);
  const matchedMustSet = new Set(compatibility?.matched_must_have || []);
  const matchedNiceSet = new Set(compatibility?.matched_nice_to_have || []);

  const handleDownloadPDF = async () => {
    if (!pdfUrl) return;

    setIsDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'tailored_resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStartOver = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    sessionStorage.removeItem('tailoredResult');
    sessionStorage.removeItem('tailoredResume');
    sessionStorage.removeItem('originalFileName');
    sessionStorage.removeItem('pdfBlobUrl');
    router.push('/tailor');
  };

  if (!result?.resume) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner message="Loading results..." />
        </main>
        <Footer />
      </div>
    );
  }

  const score = compatibility?.score ?? 0;
  const scoreAngle = `${(score / 100) * 360}deg`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-full mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-cyan-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Your Tailored Resume is Ready
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Skill-by-skill comparison against the job description with a compatibility score.
            </p>
          </div>

          {/* Compatibility + Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#06b6d4 0deg, #06b6d4 ${scoreAngle}, #e5e7eb ${scoreAngle})`,
                    }}
                  />
                  <div className="absolute inset-2 rounded-full bg-white flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold text-gray-800">{score}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Score</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-600 mb-1">Compatibility Overview</p>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {score >= 80
                      ? 'Strong Match'
                      : score >= 60
                      ? 'Solid Alignment'
                      : 'Needs Attention'}
                  </h2>
                  <p className="text-gray-600">
                    {compatibility?.matched_must_have.length ?? 0} / {jdMust.length} required skills matched ·{' '}
                    {compatibility?.matched_nice_to_have.length ?? 0} / {jdNice.length} nice-to-haves matched
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownloadPDF}
                  disabled={!pdfUrl || isDownloading}
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </button>
                <button
                  onClick={handleStartOver}
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  Start Over
                </button>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-100">
                <p className="font-semibold text-cyan-700">Must-have coverage</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round((compatibility?.must_coverage || 0) * 100)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <p className="font-semibold text-purple-700">Nice-to-have coverage</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round((compatibility?.nice_coverage || 0) * 100)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="font-semibold text-green-700">Resume skills listed</p>
                <p className="text-2xl font-bold text-gray-800">{resumeSkills.length}</p>
              </div>
            </div>
          </div>

          {/* Skills comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-cyan-600">From your resume</p>
                  <h3 className="text-xl font-bold text-gray-800">Resume Skills</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  {resumeSkills.length} skills
                </span>
              </div>
              {resumeSkills.length === 0 ? (
                <p className="text-gray-500">No skills detected in your resume.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resumeSkills.map((skill) => {
                    const isMatch = matchedResumeSkillSet.has(skill);
                    return (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${
                          isMatch
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {skill}
                        {isMatch && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-cyan-600">From the JD</p>
                    <h3 className="text-xl font-bold text-gray-800">Required Skills</h3>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {jdMust.length} must-have
                  </span>
                </div>
                {jdMust.length === 0 ? (
                  <p className="text-gray-500">No required skills were extracted from the JD.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {jdMust.map((skill) => {
                      const matched = matchedMustSet.has(skill);
                      return (
                        <span
                          key={skill}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${
                            matched
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {skill}
                          {matched ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">Nice-to-Have Skills</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {jdNice.length} optional
                  </span>
                </div>
                {jdNice.length === 0 ? (
                  <p className="text-gray-500">No nice-to-have skills were extracted.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {jdNice.map((skill) => {
                      const matched = matchedNiceSet.has(skill);
                      return (
                        <span
                          key={skill}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${
                            matched
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {skill}
                          {matched && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gaps & opportunities */}
          {(compatibility?.missing_must_have.length || compatibility?.missing_nice_to_have.length) && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              {compatibility?.missing_must_have.length ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Critical gaps (must-have)</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {compatibility?.missing_must_have.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-2 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {compatibility?.missing_nice_to_have.length ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Nice-to-have opportunities</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {compatibility?.missing_nice_to_have.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-2 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Resume Preview */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                <FileJson className="w-7 h-7" />
                Your Tailored Resume
              </h2>
              <p className="text-white/90 mt-1 text-sm">
                Preview your optimized resume below
              </p>
            </div>

            {pdfUrl ? (
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                {pdfLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
                      <p className="text-gray-600">Loading preview...</p>
                    </div>
                  </div>
                )}
                <div className="p-4 md:p-8 flex items-center justify-center min-h-[900px]">
                  <div className="bg-white shadow-2xl rounded-lg overflow-hidden w-full max-w-4xl">
                    <iframe
                      src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                      className="w-full h-[850px] border-0"
                      title="Resume PDF Preview"
                      onLoad={() => setPdfLoading(false)}
                      style={{
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                  <FileJson className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  PDF preview not available
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Please download the PDF to view your resume
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

