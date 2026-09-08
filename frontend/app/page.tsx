'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LandingProductVisual from '@/components/LandingProductVisual';
import { Upload, FileText, Download } from 'lucide-react';

const features = [
  {
    icon: '/figma-icons/ai.png',
    title: 'AI Powered Matching',
    description: 'Advanced AI analyzes job descriptions and optimizes your resume content',
  },
  {
    icon: '/figma-icons/severity.png',
    title: 'Keyword Optimization',
    description: 'Automatically identifies and emphasizes relevant keywords from job postings',
  },
  {
    icon: '/figma-icons/flash-on.png',
    title: 'Instant Results',
    description: 'Get your tailored resume in seconds, not hours of manual editing',
  },
  {
    icon: '/figma-icons/document.png',
    title: 'Professional PDF Output',
    description: 'LaTeX-powered PDF generation for perfect formatting and typography',
  },
  {
    icon: '/figma-icons/shield.png',
    title: 'Privacy First',
    description: 'Your data is processed securely and never stored on our servers',
  },
  {
    icon: '/figma-icons/outline.png',
    title: 'ATS-Friendly Formatting',
    description: 'Ensure your resume meets ATS standards with clean, optimized formatting',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-6 md:px-10 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center gap-6 text-center mb-20">
              <h1 className="font-bold text-[40px] md:text-[64px] leading-[1.05] tracking-[-1.28px] text-black">
                Tailor your resume for each job
              </h1>
              <p className="text-[20px] md:text-[24px] text-black/75">
                Install the Chrome extension and tailor your resume right from the job posting.
              </p>
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/extension"
                  className="inline-flex items-center justify-center bg-[#187fe7] hover:bg-[#146bc7] text-white font-medium text-[16px] px-6 py-3.5 rounded-[14px] shadow-[0px_4px_2px_rgba(0,0,0,0.25)] transition-colors"
                >
                  Get the Extension
                </Link>
                <Link
                  href="/signup"
                  className="text-[15px] text-black/60 hover:text-[#187fe7] transition-colors"
                >
                  or use refactr on the web &rarr;
                </Link>
              </div>
            </div>

            <LandingProductVisual />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 md:px-10 bg-[#f7f7f7]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="font-semibold text-[36px] md:text-[48px] tracking-[-0.96px] text-black mb-4">
                How It Works
              </h2>
              <p className="text-[20px] md:text-[24px] font-light text-black tracking-[-0.48px]">
                Three simple steps to your tailored or reformatted resume
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-[#e6e6e6] rounded-full mb-6">
                  <Upload className="w-7 h-7 text-[#187fe7]" />
                </div>
                <h3 className="text-[20px] font-medium text-black mb-3">
                  1. Upload Resume
                </h3>
                <p className="text-black/75">
                  Upload your existing resume in PDF format. Our AI will extract all the information.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-[#e6e6e6] rounded-full mb-6">
                  <FileText className="w-7 h-7 text-[#187fe7]" />
                </div>
                <h3 className="text-[20px] font-medium text-black mb-3">
                  2. Choose Tailor or Reformat
                </h3>
                <p className="text-black/75">
                  Paste a job description for tailoring, or skip straight to ATS reformatting.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-[#e6e6e6] rounded-full mb-6">
                  <Download className="w-7 h-7 text-[#187fe7]" />
                </div>
                <h3 className="text-[20px] font-medium text-black mb-3">
                  3. Download Your PDF
                </h3>
                <p className="text-black/75">
                  Download a tailored or ATS-friendly PDF, ready to submit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 md:px-10 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-16">
              <h2 className="font-semibold text-[36px] md:text-[48px] tracking-[-0.96px] text-black mb-4">
                Powerful Features
              </h2>
              <p className="text-[20px] md:text-[24px] font-light text-black tracking-[-0.48px]">
                Everything you need for a powerful application
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white border border-[#e6e6e6] rounded-xl p-8 pt-5 flex flex-col gap-5"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={feature.icon} alt="" className="w-[45px] h-[45px]" />
                    <h3 className="text-[24px] font-medium text-black">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-[16px] font-medium text-black">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 md:px-10 bg-[#f7f7f7]">
          <div className="container mx-auto max-w-4xl flex flex-col items-center gap-6 text-center">
            <h2 className="font-semibold text-[36px] md:text-[48px] tracking-[-0.96px] text-black">
              Land Your Dream Job
            </h2>
            <p className="text-[20px] md:text-[24px] font-medium text-black">
              Start Tailoring NOW !!!
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/extension"
                className="inline-flex items-center justify-center bg-[#187fe7] hover:bg-[#146bc7] text-white font-medium text-[16px] px-6 py-3.5 rounded-[14px] shadow-[0px_4px_2px_rgba(0,0,0,0.25)] transition-colors"
              >
                Get the Extension
              </Link>
              <Link
                href="/signup"
                className="text-[15px] text-black/60 hover:text-[#187fe7] transition-colors"
              >
                or use refactr on the web &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
