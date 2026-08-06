import type { GeneratedResumeRow } from '@/lib/supabase/resumes';

const JUNK_TITLE_PATTERNS = [
  /search for more than just job titles/i,
  /^linkedin$/i,
  /^indeed/i,
  /^glassdoor/i,
  /^handshake/i,
  /sign in/i,
  /log in/i,
  /^job search/i,
];

/** Cleans an extension-captured job title, which sometimes falls back to document.title when JD extraction partially fails. */
export function cleanJobTitle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Job board tab titles are often "Role title | Company | LinkedIn" - take the first segment.
  const firstSegment = raw.split('|')[0].trim();
  if (!firstSegment) return null;
  if (JUNK_TITLE_PATTERNS.some((pattern) => pattern.test(firstSegment))) return null;
  return firstSegment;
}

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  'Software / Tech': ['software', 'engineer', 'developer', 'frontend', 'backend', 'full stack', 'devops', 'sre', 'platform', 'cloud', 'infrastructure', 'security', 'qa', 'mobile', 'ios', 'android'],
  'Data / AI': ['data scientist', 'data engineer', 'machine learning', 'ml engineer', 'ai ', 'analytics', 'data analyst', 'research scientist'],
  Finance: ['finance', 'accounting', 'investment', 'banking', 'audit', 'actuary', 'financial analyst'],
  'Marketing / Sales': ['marketing', 'sales', 'growth', 'seo', 'social media', 'brand', 'account executive', 'business development'],
  Healthcare: ['nurse', 'clinical', 'medical', 'health', 'pharma', 'patient'],
  Design: ['designer', 'design', 'ux', 'ui', 'creative'],
  'Operations / Business': ['operations', 'project manager', 'product manager', 'program manager', 'business analyst', 'consultant', 'hr', 'recruiter', 'legal'],
};

/** Client-side keyword-bucket estimate - no dedicated industry field exists in the JD model. */
export function inferIndustry(title: string | null | undefined, company: string | null | undefined): string {
  const haystack = `${title ?? ''} ${company ?? ''}`.toLowerCase();
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) return industry;
  }
  return 'Other';
}

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase().replace(/\s+/g, ' ');
}

export interface RecentActivityItem {
  id: string;
  title: string;
  company: string | null;
  score: number | null;
  createdAt: string;
}

export interface ApplicationStats {
  total: number;
  avgScore: number | null;
  topRoles: { role: string; count: number }[];
  topIndustries: { industry: string; count: number }[];
  recentActivity: RecentActivityItem[];
}

export function computeApplicationStats(rows: GeneratedResumeRow[]): ApplicationStats {
  const tailored = rows.filter((r) => r.tailoring_options?.mode === 'tailor');

  const roleCounts = new Map<string, number>();
  const industryCounts = new Map<string, number>();
  const scores: number[] = [];

  for (const row of tailored) {
    const title = cleanJobTitle(row.job_title);
    if (title) {
      roleCounts.set(title, (roleCounts.get(title) ?? 0) + 1);
    }
    const industry = inferIndustry(title, row.company);
    industryCounts.set(industry, (industryCounts.get(industry) ?? 0) + 1);

    const score = row.tailoring_options?.compatibility?.score ?? row.tailoring_options?.score;
    if (typeof score === 'number') scores.push(score);
  }

  const topRoles = Array.from(roleCounts.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topIndustries = Array.from(industryCounts.entries())
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const recentActivity: RecentActivityItem[] = tailored.slice(0, 5).map((row) => ({
    id: row.id,
    title: cleanJobTitle(row.job_title) ?? 'Untitled role',
    company: row.company,
    score: row.tailoring_options?.compatibility?.score ?? row.tailoring_options?.score ?? null,
    createdAt: row.created_at,
  }));

  return {
    total: tailored.length,
    avgScore,
    topRoles,
    topIndustries,
    recentActivity,
  };
}

export interface SkillStats {
  mostMatched: { skill: string; count: number }[];
  skillsToAdd: { skill: string; count: number }[];
}

export function computeSkillStats(rows: GeneratedResumeRow[]): SkillStats {
  const matchedCounts = new Map<string, { label: string; count: number }>();
  const missingCounts = new Map<string, { label: string; count: number }>();

  const tally = (map: Map<string, { label: string; count: number }>, skills: string[]) => {
    for (const skill of skills) {
      const key = normalizeSkill(skill);
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { label: skill.trim(), count: 1 });
      }
    }
  };

  for (const row of rows) {
    const compatibility = row.tailoring_options?.compatibility;
    if (!compatibility) continue;
    tally(matchedCounts, [...compatibility.matched_must_have, ...compatibility.matched_nice_to_have]);
    tally(missingCounts, [...compatibility.missing_must_have, ...compatibility.missing_nice_to_have]);
  }

  const toSortedList = (map: Map<string, { label: string; count: number }>) =>
    Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(({ label, count }) => ({ skill: label, count }));

  return {
    mostMatched: toSortedList(matchedCounts),
    skillsToAdd: toSortedList(missingCounts),
  };
}
