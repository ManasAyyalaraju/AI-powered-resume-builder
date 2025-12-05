'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Target, Sparkles } from 'lucide-react';
import { tailorResume } from '@/lib/api';
import { Resume } from '@/types/resume';

export default function TailorPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const canSubmit = selectedFile && jobDescription.length >= 100;

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
      sessionStorage.setItem('tailoredResume', JSON.stringify(jsonResponse.data));
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

  const handleRetry = () => {
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Tailoring
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Tailor Your Resume
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your resume and paste the job description. Our AI will optimize your resume to match the job requirements.
            </p>
          </div>

          {/* Main Content */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <LoadingSpinner 
                message="Tailoring your resume..."
                submessage="This may take 10-30 seconds. Please wait."
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
                  <Target className="w-6 h-6" />
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
                  💡 Tips for best results:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Use a well-formatted PDF resume with clear sections</li>
                  <li>• Include the complete job description with requirements and responsibilities</li>
                  <li>• The more detailed the job description, the better the tailoring</li>
                  <li>• Processing typically takes 10-30 seconds depending on resume length</li>
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

