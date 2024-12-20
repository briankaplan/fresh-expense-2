'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Expense } from '@/types';
import { toast } from 'react-hot-toast';

interface ExpenseUploaderProps {
  onUpload: (expenses: Expense[]) => void;
}

export const ExpenseUploader: React.FC<ExpenseUploaderProps> = ({ onUpload }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: true,
    onDrop: async (files) => {
      setIsProcessing(true);
      setError(null);

      try {
        // Process files and extract expense data
        const processedExpenses = await Promise.all(
          files.map(async (file) => {
            // TODO: Implement actual OCR/processing
            return {
              id: Math.random().toString(36).substr(2, 9),
              date: new Date().toISOString(),
              merchant: file.name.split('.')[0],
              amount: Math.random() * 1000,
              category: 'uncategorized',
              description: `Expense from ${file.name}`,
              type: 'business'
            } as Expense;
          })
        );

        onUpload(processedExpenses);
        toast.success(`Successfully processed ${files.length} receipts`);
      } catch (err) {
        console.error('Failed to process receipts:', err);
        setError('Failed to process receipts');
        toast.error('Failed to process receipts');
      } finally {
        setIsProcessing(false);
      }
    }
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          p-8 border-2 border-dashed rounded-lg text-center
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        <div className="flex flex-col items-center gap-2">
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p>Processing receipts...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop the receipts here...'
                  : 'Drag & drop receipts, or click to select'}
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, PNG, and JPEG files
              </p>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}; 