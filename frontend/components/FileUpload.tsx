'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { formatFileSize, isPDF } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid PDF file (max 10MB)');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (!isPDF(file)) {
        setError('Please upload a PDF file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = () => {
    onFileSelect(null);
    setError('');
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200 bg-white
            ${isDragActive 
              ? 'border-cyan-500 bg-cyan-50' 
              : 'border-gray-300 hover:border-cyan-400'
            }
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`
              p-4 rounded-full
              ${isDragActive 
                ? 'bg-cyan-100' 
                : 'bg-gray-100'
              }
            `}>
              <Upload className={`
                w-8 h-8
                ${isDragActive 
                  ? 'text-cyan-600' 
                  : 'text-gray-600'
                }
              `} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-800 mb-1">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-gray-600">
                or click to browse
              </p>
            </div>
            
            <p className="text-xs text-gray-500">
              PDF only, max 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-500 bg-green-50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-green-100 rounded">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-800 truncate">
                    {selectedFile.name}
                  </p>
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <button
              onClick={removeFile}
              className="p-1 hover:bg-green-200 rounded transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

