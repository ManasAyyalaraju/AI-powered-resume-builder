'use client';

import { FileText, Briefcase, Files, CheckCircle2, Bell, Sparkles, Download, RefreshCw } from 'lucide-react';

const skills = [
  { label: 'Product Management', checked: true },
  { label: 'Market Research', checked: true },
  { label: 'Agile', checked: false },
  { label: 'Data Analysis', checked: false },
];

const actions = [
  'Suggest bullet point rewrites',
  'Reorder experience by relevance',
  'Check for keyword match',
];

const reviewItems = [
  'Experience section rewritten to highlight key skills',
  'Skills list re-prioritized for relevance',
  'Bullet points now use description-matching keywords',
];

export default function LandingProductVisual() {
  return (
    <div className="grid lg:grid-cols-12 gap-6 items-start">
      {/* Flow diagram */}
      <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center bg-gray-50">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <span className="text-xs text-gray-500 text-center">Original<br />Resume</span>
          </div>
          <span className="text-gray-300 text-lg">→</span>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center bg-gray-50">
              <Briefcase className="w-5 h-5 text-gray-500" />
            </div>
            <span className="text-xs text-gray-500 text-center">Job<br />Description</span>
          </div>
        </div>

        <div className="flex justify-center my-3 text-gray-300">↓</div>

        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-lg border-2 border-blue-600 flex items-center justify-center bg-blue-50">
            <Files className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-700">Refactored Resume</span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
          <Bell className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-800 leading-snug">
            Keyword optimization successful! Match increased by 35%
          </p>
        </div>
      </div>

      {/* Browser mockup */}
      <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center gap-1.5 bg-gray-100 px-4 py-3 border-b border-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 p-5">
          {/* Resume preview */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div>
                <div className="h-2.5 w-24 bg-gray-300 rounded" />
                <div className="h-2 w-32 bg-gray-200 rounded mt-1.5" />
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="h-2 w-full bg-gray-100 rounded" />
              <div className="h-2 w-5/6 bg-gray-100 rounded" />
              <div className="h-2 w-4/6 bg-gray-100 rounded" />
            </div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="h-2 w-12 bg-gray-100 rounded-full" />
              <span className="h-2 w-16 bg-gray-100 rounded-full" />
              <span className="h-2 w-10 bg-gray-100 rounded-full" />
            </div>
          </div>

          {/* Refactor panel */}
          <div className="text-left">
            <p className="text-xs font-semibold text-gray-800 mb-3">
              Refactor your resume to fit: <span className="text-gray-400 font-normal">[Job Description]</span>
            </p>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                Step 1: Upload Resume
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                Step 2: Paste Job Description
              </div>
            </div>

            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Optimize for which skills?
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {skills.map((skill) => (
                <label key={skill.label} className="flex items-center gap-1 text-[11px] text-gray-600">
                  <input type="checkbox" readOnly checked={skill.checked} className="w-3 h-3 accent-blue-600" />
                  {skill.label}
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {actions.map((action) => (
                <span
                  key={action}
                  className="px-2 py-1 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {action}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Generate refactored draft
            </div>

            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium border border-gray-300 text-gray-600">
                <RefreshCw className="w-3 h-3" />
                Re-optimize
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium bg-gray-900 text-white">
                <Download className="w-3 h-3" />
                Download Draft
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review checklist */}
      <div className="lg:col-span-3 flex flex-col gap-3">
        {reviewItems.map((item) => (
          <div key={item} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-700 leading-snug">{item}</p>
                <span className="text-xs text-blue-600 font-medium">Review changes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
