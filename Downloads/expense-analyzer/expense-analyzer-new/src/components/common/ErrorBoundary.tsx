'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  error: Error;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
} 