'use client';

import type { GeneratedResumeRow } from '@/lib/supabase/resumes';
import { computeSkillStats } from '@/lib/dashboard-stats';

interface SkillsInsightsProps {
  rows: GeneratedResumeRow[];
  loading: boolean;
}

export default function SkillsInsights({ rows, loading }: SkillsInsightsProps) {
  const { mostMatched, skillsToAdd } = computeSkillStats(rows);
  const hasData = mostMatched.length > 0 || skillsToAdd.length > 0;

  return (
    <div className="bg-[#fffcfc] border border-black rounded min-h-[220px] p-4 sm:p-5 flex flex-col gap-4">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-black/50">Loading…</span>
        </div>
      ) : !hasData ? (
        <div className="flex-1 flex items-center justify-center text-center px-2">
          <p className="text-[13px] text-black/50">
            Tailor a resume to see which skills match job descriptions and which ones you should add.
          </p>
        </div>
      ) : (
        <>
          <div>
            <h3 className="text-[13px] font-semibold text-black mb-2">Most Matched Skills</h3>
            {mostMatched.length === 0 ? (
              <p className="text-[12px] text-black/40">Not enough data yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {mostMatched.map((s) => (
                  <span
                    key={s.skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#187fe7]/10 text-[#187fe7] border border-[#187fe7]/20"
                  >
                    {s.skill}
                    {s.count > 1 && <span className="text-[#187fe7]/60">×{s.count}</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-black mb-2">Skills to Add</h3>
            {skillsToAdd.length === 0 ? (
              <p className="text-[12px] text-black/40">No recurring gaps — nice work.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {skillsToAdd.map((s) => (
                  <span
                    key={s.skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20"
                  >
                    {s.skill}
                    {s.count > 1 && <span className="text-amber-700/60">×{s.count}</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
