"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
}

export default function LoadingSpinner({
  message,
  submessage,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="absolute inset-0 blur-xl bg-blue-600 opacity-20 animate-pulse" />
      </div>

      {message && (
        <p className="mt-6 text-lg font-medium text-gray-800">{message}</p>
      )}

      {submessage && <p className="mt-2 text-sm text-gray-600">{submessage}</p>}
    </div>
  );
}
