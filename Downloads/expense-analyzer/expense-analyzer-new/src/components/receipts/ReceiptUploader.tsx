'use client';

import React, { useState } from 'react';
import { processReceipt } from '@/utils/receiptProcessing';
import { Upload } from 'lucide-react';

interface ReceiptUploaderProps {
  onUpload: (receiptUrl: string) => void;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onUpload }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const receiptUrl = await processReceipt(file);
      onUpload(receiptUrl);
    } catch (err) {
      console.error('Failed to process receipt:', err);
      setError('Failed to process receipt');
    } finally {
      setIsProcessing(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="relative">
      <label 
        className={`
          flex flex-col items-center justify-center w-full h-32
          border-2 border-dashed rounded-lg
          ${isProcessing ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
          transition-colors duration-200
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className={`w-8 h-8 mb-2 ${isProcessing ? 'text-gray-400' : 'text-gray-500'}`} />
          <p className="mb-2 text-sm text-gray-500">
            {isProcessing ? 'Processing...' : 'Click to upload receipt'}
          </p>
          <p className="text-xs text-gray-500">PDF, JPG or PNG</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
      </label>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}; 