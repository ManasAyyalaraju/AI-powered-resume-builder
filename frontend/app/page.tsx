'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Upload, Sparkles, Download, Shield, Zap, FileText, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Resume Tailoring & Reformatting
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                Tailor or Reformat Your Resume for
                <span className="text-cyan-600"> Every Application</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Upload your resume, choose to tailor it with a job description or instantly reformat it into an ATS-friendly PDF. 
                Our AI handles the heavy lifting to make you stand out.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tailor"
                  className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Try For Free
                </Link>
                
                <a
                  href="https://github.com/ManasAyyalaraju/AI-powered-resume-builder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-lg border-2 border-gray-300 transition-all"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Three simple steps to your tailored or reformatted resume
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-6">
                  <Upload className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  1. Upload Resume
                </h3>
                <p className="text-gray-600">
                  Upload your existing resume in PDF format. Our AI will extract all the information.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  2. Choose Tailor or Reformat
                </h3>
                <p className="text-gray-600">
                  Paste a job description for tailoring, or skip straight to ATS reformatting.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  3. Download Your PDF
                </h3>
                <p className="text-gray-600">
                  Download a tailored or ATS-friendly PDF, ready to submit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to stand out in your job applications
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Sparkles className="w-10 h-10 text-cyan-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  AI-Powered Matching
                </h3>
                <p className="text-gray-600">
                  Advanced AI analyzes job descriptions and optimizes your resume content.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Target className="w-10 h-10 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Keyword Optimization
                </h3>
                <p className="text-gray-600">
                  Automatically identifies and emphasizes relevant keywords from job postings.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Zap className="w-10 h-10 text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Instant Results
                </h3>
                <p className="text-gray-600">
                  Get your tailored resume in seconds, not hours of manual editing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <FileText className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Professional PDF Output
                </h3>
                <p className="text-gray-600">
                  LaTeX-powered PDF generation for perfect formatting and typography.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Shield className="w-10 h-10 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Privacy First
                </h3>
                <p className="text-gray-600">
                  Your data is processed securely and never stored on our servers.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Download className="w-10 h-10 text-pink-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ATS-Friendly Formatting
                </h3>
                <p className="text-gray-600">
                  Ensure your resume meets ATS standards with clean, optimized formatting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-cyan-500 to-purple-500">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start tailoring your resume now and increase your chances of getting interviews.
            </p>
            <Link
                  href="/tailor"
                  className="inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Get Started Now
                </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
