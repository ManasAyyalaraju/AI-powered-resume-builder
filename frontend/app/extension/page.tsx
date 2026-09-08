'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { EXTENSION_DOWNLOAD_URL } from '@/lib/extension';
import { Download, MousePointerClick, ToggleLeft, FolderOpen, Pin, LogIn } from 'lucide-react';

const steps = [
  {
    icon: Download,
    title: 'Download and unzip',
    description:
      'Click the button above to download the extension. Unzip it — you’ll get a folder named refactr-extension-release.',
  },
  {
    icon: MousePointerClick,
    title: 'Open chrome://extensions',
    description: 'Type chrome://extensions into your address bar and hit enter.',
  },
  {
    icon: ToggleLeft,
    title: 'Turn on Developer mode',
    description: 'Toggle it on in the top-right corner of the page.',
  },
  {
    icon: FolderOpen,
    title: 'Click "Load unpacked"',
    description: 'Select the refactr-extension-release folder you unzipped.',
  },
  {
    icon: Pin,
    title: 'Pin refactr',
    description: 'Click the puzzle-piece icon in Chrome’s toolbar and pin refactr so it’s always visible.',
  },
  {
    icon: LogIn,
    title: 'Log in and go',
    description:
      'Visit a job posting on LinkedIn, Indeed, Glassdoor, or Handshake — refactr appears automatically. Click "Log in to refactr" the first time to connect your account.',
  },
];

export default function ExtensionPage() {
  const scrollToInstallation = () => {
    document.getElementById('installation')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="pt-24 pb-16 px-6 md:px-10 bg-white">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="font-bold text-[36px] md:text-[56px] leading-[1.05] tracking-[-1.12px] text-black mb-6">
              Tailor your resume without leaving the job posting
            </h1>
            <p className="text-[18px] md:text-[22px] text-black/75 mb-8">
              Install the refactr Chrome extension and it appears automatically on LinkedIn, Indeed,
              Glassdoor, and Handshake job pages — no copy-pasting job descriptions.
            </p>
            <a
              href={EXTENSION_DOWNLOAD_URL}
              onClick={scrollToInstallation}
              className="inline-flex items-center justify-center bg-[#187fe7] hover:bg-[#146bc7] text-white font-medium text-[16px] px-6 py-3.5 rounded-[14px] shadow-[0px_4px_2px_rgba(0,0,0,0.25)] transition-colors"
            >
              Download for Chrome
            </a>
            <p className="text-[14px] text-black/60 mt-4">
              Requires Chrome 116+. Not yet available for Firefox or Safari.
            </p>
          </div>
        </section>

        <section id="installation" className="py-16 px-6 md:px-10 bg-[#f7f7f7]">
          <div className="container mx-auto max-w-3xl">
            <h2 className="font-semibold text-[28px] md:text-[36px] tracking-[-0.72px] text-black mb-10 text-center">
              Installation
            </h2>

            <ol className="flex flex-col gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="flex items-start gap-5">
                    <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 bg-white border border-[#e6e6e6] rounded-full">
                      <Icon className="w-5 h-5 text-[#187fe7]" />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-medium text-black mb-1">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-black/75">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="text-black/60 text-[15px] mt-10 text-center">
              You&apos;ll need a refactr account with at least one saved resume — the extension
              prompts you to sign in, and you can add a resume from your dashboard afterward.
            </p>
          </div>
        </section>

        <section className="py-12 px-6 md:px-10 bg-white text-center">
          <p className="text-black/75">
            Prefer not to install anything?{' '}
            <Link href="/signup" className="text-[#187fe7] hover:text-[#146bc7] font-medium">
              Tailor resumes on the web instead &rarr;
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
