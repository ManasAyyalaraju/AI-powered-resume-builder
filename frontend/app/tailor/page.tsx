'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Sparkles, Wand2 } from 'lucide-react';
import { tailorResume, reformatResume } from '@/lib/api';

type FlowTab = 'tailor' | 'reformat';

export default function TailorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FlowTab>('tailor');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [reformatFile, setReformatFile] = useState<File | null>(null);
  const [reformatLoading, setReformatLoading] = useState(false);
  const [reformatError, setReformatError] = useState<string>('');
  const [reformatSuccess, setReformatSuccess] = useState<string>('');
  const [reformatPdfUrl, setReformatPdfUrl] = useState<string>('');

  const canSubmit = selectedFile && jobDescription.length >= 100;

  const handleTabChange = (tab: FlowTab) => {
    setActiveTab(tab);
    setError('');
    setReformatError('');
    setReformatSuccess('');
    if (reformatPdfUrl) {
      URL.revokeObjectURL(reformatPdfUrl);
      setReformatPdfUrl('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !jobDescription) return;

    setIsLoading(true);
    setError('');

    try {
      // Request JSON first to get structured data
      const jsonResponse = await tailorResume({
        pdfFile: selectedFile,
        jobDescription,
        outputFormat: 'json',
      });

      if (!jsonResponse.success || !jsonResponse.data) {
        setError(jsonResponse.error || 'Failed to tailor resume. Please try again.');
        return;
      }

      // Request PDF version
      const pdfResponse = await tailorResume({
        pdfFile: selectedFile,
        jobDescription,
        outputFormat: 'pdf',
      });

      if (!pdfResponse.success || !pdfResponse.data) {
        setError('Failed to generate PDF. Please try again.');
        return;
      }

      // Store both JSON and PDF blob
      sessionStorage.setItem('tailoredResult', JSON.stringify(jsonResponse.data));
      sessionStorage.setItem('originalFileName', selectedFile.name);
      
      // Create blob URL for PDF and store it
      const pdfBlob = pdfResponse.data as Blob;
      const pdfUrl = URL.createObjectURL(pdfBlob);
      sessionStorage.setItem('pdfBlobUrl', pdfUrl);
      
      // Navigate to results page
      router.push('/results');
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please check if the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReformatSubmit = async () => {
    if (!reformatFile) return;

    setReformatLoading(true);
    setReformatError('');
    setReformatSuccess('');
    if (reformatPdfUrl) {
      URL.revokeObjectURL(reformatPdfUrl);
      setReformatPdfUrl('');
    }

    try {
      const pdfResponse = await reformatResume({
        pdfFile: reformatFile,
      });

      if (!pdfResponse.success || !pdfResponse.data) {
        setReformatError(pdfResponse.error || 'Failed to reformat resume. Please try again.');
        return;
      }

      const pdfBlob = pdfResponse.data as Blob;
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setReformatPdfUrl(pdfUrl);
      setReformatSuccess('ATS-friendly PDF is ready. You can preview or download it below.');
    } catch (err) {
      console.error('Error:', err);
      setReformatError('An unexpected error occurred. Please check if the backend is running.');
    } finally {
      setReformatLoading(false);
    }
  };

  const handleDownloadReformat = () => {
    if (!reformatPdfUrl) return;
    const link = document.createElement('a');
    link.href = reformatPdfUrl;
    link.download = 'ats_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetry = () => {
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Tailor or Reformat
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Customize Your Resume Experience
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {activeTab === 'tailor'
                ? 'Upload your resume and paste a job description to tailor it for that role.'
                : 'Upload your resume to instantly reformat it into an ATS-friendly PDF—no job description needed.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-gray-100 rounded-full p-1 shadow-inner">
              <button
                onClick={() => handleTabChange('tailor')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'tailor'
                    ? 'bg-white text-cyan-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Tailoring
              </button>
              <button
                onClick={() => handleTabChange('reformat')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'reformat'
                    ? 'bg-white text-cyan-600 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Reformatting
              </button>
            </div>
          </div>

          {/* Main Content */}
          {activeTab === 'tailor' ? (
            isLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-12">
                <LoadingSpinner 
                  message="Tailoring your resume..."
                  submessage="This may take 1-3 minutes. Please wait."
                />
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <ErrorMessage 
                  message={error}
                  onRetry={handleRetry}
                />
              </div>
            ) : (
              <>
                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Left Column - File Upload */}
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Step 1: Upload Resume
                      </h2>
                      <p className="text-gray-600">
                        Upload your current resume in PDF format
                      </p>
                    </div>
                    <FileUpload 
                      selectedFile={selectedFile}
                      onFileSelect={setSelectedFile}
                    />
                  </div>

                  {/* Right Column - Job Description */}
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Step 2: Job Description
                      </h2>
                      <p className="text-gray-600">
                        Paste the complete job description
                      </p>
                    </div>
                    <JobDescriptionInput 
                      value={jobDescription}
                      onChange={setJobDescription}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`
                      inline-flex items-center justify-center gap-3 
                      px-12 py-5 rounded-xl font-semibold text-lg
                      shadow-lg hover:shadow-xl
                      transition-all duration-200
                      ${canSubmit
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white cursor-pointer transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Tailor My Resume
                  </button>
                  
                  {!canSubmit && (
                    <p className="mt-4 text-sm text-gray-500">
                      {!selectedFile 
                        ? 'Please upload your resume' 
                        : 'Please provide a job description (min 100 characters)'
                      }
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-12 bg-gradient-to-br from-cyan-50 to-purple-50 border border-cyan-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    💡 Tips for best tailoring results:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Use a well-formatted PDF resume with clear sections</li>
                    <li>• Include the complete job description with requirements and responsibilities</li>
                    <li>• The more detailed the job description, the better the tailoring</li>
                    <li>• Processing typically takes 1-3 minutes depending on resume length</li>
                  </ul>
                </div>
              </>
            )
          ) : reformatLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <LoadingSpinner 
                message="Reformatting your resume..."
                submessage="This usually finishes in under a minute."
              />
            </div>
          ) : reformatError ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <ErrorMessage 
                message={reformatError}
                onRetry={() => setReformatError('')}
              />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-cyan-600" />
                    Reformat Your Resume
                  </h2>
                  <p className="text-gray-600">
                    Upload your resume to instantly generate an ATS-friendly, clean PDF without changing your content for a specific role.
                  </p>
                </div>

                <div className="mb-8">
                  <FileUpload 
                    selectedFile={reformatFile}
                    onFileSelect={setReformatFile}
                  />
                </div>

                <div className="text-center">
                  <button
                    onClick={handleReformatSubmit}
                    disabled={!reformatFile || reformatLoading}
                    className={`
                      inline-flex items-center justify-center gap-3
                      px-12 py-5 rounded-xl font-semibold text-lg
                      shadow-lg hover:shadow-xl
                      transition-all duration-200
                      ${reformatFile && !reformatLoading
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white cursor-pointer transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    <Wand2 className="w-6 h-6" />
                    Reformat My Resume
                  </button>

                  {!reformatFile && (
                    <p className="mt-4 text-sm text-gray-500">
                      Please upload your resume to start reformatting
                    </p>
                  )}
                </div>

                {reformatSuccess && (
                  <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm text-center">
                    {reformatSuccess}
                  </div>
                )}
              </div>

              {/* Info Box */}

                {reformatPdfUrl && (
                  <div className="mt-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                      <div className="text-white font-semibold">ATS-friendly PDF Preview</div>
                      <button
                        onClick={handleDownloadReformat}
                        className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-cyan-700 font-semibold px-4 py-2 rounded-lg shadow"
                      >
                        Download PDF
                      </button>
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="bg-white rounded-lg shadow-inner overflow-hidden">
                        <iframe
                          src={`${reformatPdfUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                          className="w-full h-[750px] border-0"
                          title="Reformatted Resume PDF Preview"
                        />
                      </div>
                    </div>
                  </div>
                )}
              <div className="mt-8 bg-gradient-to-br from-cyan-50 to-purple-50 border border-cyan-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  💡 Tips for ATS-friendly formatting:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Use clear section headings like Education, Experience, and Skills</li>
                  <li>• Keep bullet points concise and avoid images or tables</li>
                  <li>• Ensure contact information is present at the top of your resume</li>
                  <li>• Double-check the downloaded PDF before submitting applications</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

