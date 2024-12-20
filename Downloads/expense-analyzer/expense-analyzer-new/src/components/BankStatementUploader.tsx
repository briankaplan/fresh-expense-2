'use client';

import React, { useState } from 'react';
import { BankTransaction } from '@/types';
import { parseCSV } from '@/utils/csvParser';
import { Upload, AlertCircle } from 'lucide-react';

interface BankStatementUploaderProps {
  onUpload: (data: BankTransaction[]) => void;
  onError: (error: string) => void;
}

export const BankStatementUploader: React.FC<BankStatementUploaderProps> = ({
  onUpload,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const transactions = parseCSV(text);
      onUpload(transactions);
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      onError(error instanceof Error ? error.message : 'Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <label
        htmlFor="bank-statement-upload"
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          ${isProcessing 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
          text-white transition-colors
        `}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Bank Statement
          </>
        )}
      </label>
      <input
        id="bank-statement-upload"
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={isProcessing}
        className="hidden"
      />
    </div>
  );
};