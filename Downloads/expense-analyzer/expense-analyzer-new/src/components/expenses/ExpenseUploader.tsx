'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, FileText, X } from 'lucide-react';
import { processExpenses } from '@/utils/expenseProcessing';
import type { Expense } from '@/types';

interface ExpenseUploaderProps {
  onUpload: (expenses: Expense[]) => void;
  onClose?: () => void;
}

export const ExpenseUploader: React.FC<ExpenseUploaderProps> = ({ 
  onUpload,
  onClose 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const expenses = await processExpenses(selectedFile);
      onUpload(expenses);
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to process expenses:', err);
      setError('Failed to process expenses. Please ensure the file is in the correct format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a CSV file');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upload Expenses</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300'}
          transition-colors duration-200
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-4">
            <FileText className="w-12 h-12 mx-auto text-green-500" />
            <div>
              <p className="font-medium text-green-700">{selectedFile.name}</p>
              <p className="text-sm text-green-600">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-gray-600">
                Drag & drop your expense CSV file here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1"
              >
                Browse files
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isProcessing}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            ${selectedFile
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
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
              Upload Expenses
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 