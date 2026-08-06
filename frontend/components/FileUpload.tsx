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
            border border-dashed rounded-[4px] p-8 text-center cursor-pointer
            transition-all duration-200 bg-[#fffcfc]
            ${isDragActive
              ? 'border-[#187fe7] bg-blue-50'
              : 'border-[#504b4b] hover:border-[#187fe7]'
            }
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-3">
            <div className={`
              p-3 rounded-full
              ${isDragActive
                ? 'bg-blue-100'
                : 'bg-[#ebeaea]'
              }
            `}>
              <Upload className={`
                w-6 h-6
                ${isDragActive
                  ? 'text-[#187fe7]'
                  : 'text-black'
                }
              `} />
            </div>

            <div>
              <p className="text-[12px] text-black tracking-[-0.24px] mb-1">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-[10px] font-light text-black tracking-[-0.2px]">
                or click to browse
              </p>
            </div>

            <p className="text-[10px] font-light text-black tracking-[-0.2px]">
              PDF only
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-black bg-[#fffcfc] rounded-[4px] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-[#e7f2fd] rounded">
                <FileText className="w-6 h-6 text-[#187fe7]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-black truncate">
                    {selectedFile.name}
                  </p>
                  <CheckCircle className="w-4 h-4 text-[#187fe7] flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <button
              onClick={removeFile}
              className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-black" />
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

