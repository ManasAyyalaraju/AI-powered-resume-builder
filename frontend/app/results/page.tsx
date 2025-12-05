'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Download, FileJson, RefreshCw, CheckCircle, TrendingUp } from 'lucide-react';
import { Resume } from '@/types/resume';
import { tailorResume, downloadPDF } from '@/lib/api';

export default function ResultsPage() {
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);

  useEffect(() => {
    // Retrieve the tailored resume from sessionStorage
    const storedResume = sessionStorage.getItem('tailoredResume');
    const storedFileName = sessionStorage.getItem('originalFileName');
    const storedPdfUrl = sessionStorage.getItem('pdfBlobUrl');

    if (!storedResume) {
      // If no data, redirect to tailor page
      router.push('/tailor');
      return;
    }

    try {
      const parsedResume = JSON.parse(storedResume);
      setResume(parsedResume);
      setOriginalFileName(storedFileName || 'resume.pdf');
      setPdfUrl(storedPdfUrl || '');
    } catch (error) {
      console.error('Error parsing resume:', error);
      router.push('/tailor');
    }
  }, [router]);

  const handleDownloadPDF = async () => {
    if (!pdfUrl) return;

    setIsDownloading(true);
    try {
      // Download the PDF blob
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

  const handleDownloadJSON = () => {
    if (!resume) return;

    const dataStr = JSON.stringify(resume, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tailored_resume.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    // Clean up blob URL
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    sessionStorage.removeItem('tailoredResume');
    sessionStorage.removeItem('originalFileName');
    sessionStorage.removeItem('pdfBlobUrl');
    router.push('/tailor');
  };

  if (!resume) {
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

  // Calculate some basic analytics
  const totalSkills = resume.skills?.length || 0;
  const totalExperience = resume.experience?.length || 0;
  const totalProjects = resume.projects?.length || 0;
  const totalEducation = resume.education?.length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Success Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4 shadow-lg animate-bounce-slow">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Your Resume is Ready!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Your resume has been successfully tailored to match the job description
            </p>
          </div>

          {/* Analytics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Skills Listed
                </span>
                <TrendingUp className="w-4 h-4 text-cyan-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {totalSkills}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Experience
                </span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {totalExperience}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Projects
                </span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {totalProjects}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Education
                </span>
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {totalEducation}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Download Your Resume
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadPDF}
                disabled={!pdfUrl || isDownloading}
                className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Download className="w-6 h-6" />
                {isDownloading ? 'Downloading...' : 'Download PDF Resume'}
              </button>

              <button
                onClick={handleStartOver}
                className="inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-8 py-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Start Over
              </button>
            </div>
          </div>

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

