'use client';

import React, { useState } from 'react';
import { BankTransaction } from '@/types';
import { matchMerchant } from '@/utils/merchantMatching';
import { Play, AlertCircle, CheckCircle } from 'lucide-react';

interface ProcessingResult {
  transaction: BankTransaction;
  originalMerchant: string;
  matchedMerchant: string;
  status: 'success' | 'warning' | 'error';
  message?: string;
}

interface TransactionProcessorProps {
  transactions: BankTransaction[];
  onProcessComplete?: (results: ProcessingResult[]) => void;
}

export const TransactionProcessor: React.FC<TransactionProcessorProps> = ({
  transactions,
  onProcessComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processTransactions = async () => {
    setIsProcessing(true);
    setError(null);
    const processingResults: ProcessingResult[] = [];

    try {
      for (const transaction of transactions) {
        try {
          const matchedMerchant = await matchMerchant(transaction.description);
          
          const result: ProcessingResult = {
            transaction,
            originalMerchant: transaction.description,
            matchedMerchant,
            status: matchedMerchant ? 'success' : 'warning',
            message: matchedMerchant ? 
              'Successfully matched merchant' : 
              'No merchant match found'
          };

          processingResults.push(result);
        } catch (err) {
          processingResults.push({
            transaction,
            originalMerchant: transaction.description,
            matchedMerchant: '',
            status: 'error',
            message: 'Failed to process transaction'
          });
        }
      }

      setResults(processingResults);
      onProcessComplete?.(processingResults);
    } catch (err) {
      setError('Failed to process transactions');
      console.error('Transaction processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={processTransactions}
          disabled={isProcessing || transactions.length === 0}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-white
            ${isProcessing || transactions.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          <Play className="w-4 h-4" />
          {isProcessing ? 'Processing...' : 'Process Transactions'}
        </button>

        {results.length > 0 && (
          <div className="text-sm text-gray-600">
            Processed {results.length} transactions
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Processing Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="border rounded-lg divide-y">
          {results.map((result, index) => (
            <div
              key={`${result.transaction.id}-${index}`}
              className="p-4 flex items-start gap-3"
            >
              {result.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              {result.status === 'warning' && (
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              )}
              {result.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{result.originalMerchant}</p>
                  <p className="text-sm text-gray-500">
                    ${Math.abs(result.transaction.amount).toFixed(2)}
                  </p>
                </div>
                {result.matchedMerchant && (
                  <p className="text-sm text-gray-600 mt-1">
                    Matched to: {result.matchedMerchant}
                  </p>
                )}
                {result.message && (
                  <p className={`text-sm mt-1 ${
                    result.status === 'error' ? 'text-red-600' :
                    result.status === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {result.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 