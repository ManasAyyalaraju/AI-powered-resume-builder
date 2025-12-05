"use client";

import { useState } from "react";
import { FileText, AlertCircle } from "lucide-react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  const [charCount, setCharCount] = useState(value.length);
  const minChars = 100;
  const maxChars = 10000;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange(newValue);
  };

  const isValid = charCount >= minChars && charCount <= maxChars;
  const showWarning = charCount > 0 && charCount < minChars;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText className="w-4 h-4" />
          Job Description
        </label>
        <span
          className={`text-xs ${
            showWarning
              ? "text-orange-600"
              : charCount > maxChars
              ? "text-red-600"
              : "text-gray-500"
          }`}
        >
          {charCount} / {maxChars} characters
        </span>
      </div>

      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste the job description here..."
        className={`
          w-full h-64 px-4 py-3 rounded-lg border-2
          bg-white
          text-gray-800
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
          transition-colors
          ${
            showWarning
              ? "border-orange-300"
              : charCount > maxChars
              ? "border-red-300"
              : "border-gray-300"
          }
        `}
        maxLength={maxChars}
      />

      {showWarning && (
        <div className="mt-2 flex items-start gap-2 text-sm text-orange-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Please provide at least {minChars} characters for better results.
            Current: {charCount} characters.
          </p>
        </div>
      )}

      {charCount > maxChars && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Job description is too long. Please keep it under {maxChars}{" "}
            characters.
          </p>
        </div>
      )}

      {isValid && (
        <div className="mt-2 text-sm text-green-600">
          ✓ Job description looks good!
        </div>
      )}
    </div>
  );
}
