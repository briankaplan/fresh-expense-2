'use client';

import { useState, useRef } from 'react';
import { Upload, X, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useReportStore } from '@/stores/reportStore';
import { processBatchReceipts } from '@/utils/batchReceiptProcessing';
import type { BankTransaction } from '@/types';

interface Props {
  transactions: BankTransaction[];
  onClose: () => void;
}

export const BatchReceiptUploader: React.FC<Props> = ({ transactions, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateTransactionReceipt } = useReportStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: files.length });

    try {
      const results = await processBatchReceipts(files, transactions);

      for (const match of results.matched) {
        await updateTransactionReceipt(match.transactionId, {
          receiptUrl: match.receiptUrl,
          merchant: match.ocrData.merchant,
          amount: match.ocrData.total,
          date: match.ocrData.date
        });
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      toast.success(
        `Processed ${results.matched.length} receipts, ${results.unmatched.length} unmatched`
      );
      onClose();
    } catch (err) {
      console.error('Failed to process receipts:', err);
      setError(err instanceof Error ? err.message : 'Failed to process receipts');
      toast.error('Failed to process receipts');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bulk Upload Receipts</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Choose Receipts'}
          </button>
          
          <p className="mt-4 text-sm text-gray-500">
            Upload multiple receipt images or PDFs
          </p>
        </div>

        {isProcessing && (
          <div className="mt-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-600">
                Processing receipts ({progress.current} of {progress.total})...
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          <h4 className="font-medium mb-2">Tips:</h4>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Select multiple files at once
            </li>
            <li className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Receipts will be matched automatically
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 