'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import TailoredResultView from '@/components/TailoredResultView';
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <TailoredResultView
          resumeSkills={result.resume.skills || []}
          jobDescription={result.job_description}
          compatibility={compatibility}
          pdfUrl={pdfUrl}
          primaryAction={{ label: 'Start Over', onClick: handleStartOver }}
        />
      </main>

      <Footer />
    </div>
  );
}
