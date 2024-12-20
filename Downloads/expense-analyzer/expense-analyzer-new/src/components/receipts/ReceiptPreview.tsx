'use client';

import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';
import type { BankTransaction } from '@/types';

interface Props {
  transaction: BankTransaction;
  onClose: () => void;
}

export const ReceiptPreview: React.FC<Props> = ({ transaction, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      if (!transaction.receiptUrl) return;

      const response = await fetch(transaction.receiptUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${transaction.id}.${blob.type.split('/')[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download receipt:', err);
      setError('Failed to download receipt');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full h-[90vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Receipt Preview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {transaction.description} - {formatCurrency(transaction.amount)}
            </p>
            <p className="text-sm text-gray-600">
              {formatDateDisplay(transaction.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {transaction.receiptUrl && (
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Download Receipt"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
          {transaction.receiptUrl ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <img
                src={transaction.receiptUrl}
                alt="Receipt"
                className="w-full h-full object-contain"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setError('Failed to load receipt image');
                }}
              />
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No receipt available
            </div>
          )}

          {error && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-red-50 text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 