'use client';

import { useState } from 'react';
import type { BankTransaction } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { Receipt, ArrowRight, X } from 'lucide-react';

interface ReceiptProps {
  id: string;
  url: string;
  uploadDate: string;
  merchant?: string;
  amount?: number;
}

interface Props {
  receipt: ReceiptProps;
  transactions: BankTransaction[];
  onMatch: (receiptId: string, transactionId: string) => Promise<void>;
  onSkip: () => void;
}

export const ManualReceiptMatcher: React.FC<Props> = ({
  receipt,
  transactions,
  onMatch,
  onSkip
}) => {
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const handleMatch = async () => {
    if (!selectedTransaction) return;
    
    try {
      setIsMatching(true);
      setError(null);
      await onMatch(receipt.id, selectedTransaction);
    } catch (err) {
      console.error('Failed to match receipt:', err);
      setError('Failed to match receipt');
    } finally {
      setIsMatching(false);
    }
  };

  // Filter transactions to show only unmatched ones
  const unmatchedTransactions = transactions.filter(t => !t.hasReceipt);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Match Receipt</h2>
          <button onClick={onSkip} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Receipt Preview */}
          <div>
            <h3 className="font-medium mb-2">Receipt</h3>
            <div className="border rounded-lg p-4">
              <img 
                src={receipt.url} 
                alt="Receipt"
                className="w-full h-auto rounded"
              />
              <div className="mt-2 space-y-1">
                {receipt.merchant && (
                  <p><strong>Merchant:</strong> {receipt.merchant}</p>
                )}
                {receipt.amount && (
                  <p><strong>Amount:</strong> {formatCurrency(receipt.amount)}</p>
                )}
                <p><strong>Uploaded:</strong> {format(new Date(receipt.uploadDate), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Transaction Selection */}
          <div>
            <h3 className="font-medium mb-2">Select Transaction</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {unmatchedTransactions.map(transaction => (
                <label
                  key={transaction.id}
                  className={`
                    block p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedTransaction === transaction.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="radio"
                    name="transaction"
                    value={transaction.id}
                    checked={selectedTransaction === transaction.id}
                    onChange={() => setSelectedTransaction(transaction.id)}
                    className="hidden"
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {format(transaction.date, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <p className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Skip
          </button>
          <button
            onClick={handleMatch}
            disabled={!selectedTransaction || isMatching}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2
              ${selectedTransaction
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
            `}
          >
            <Receipt size={16} />
            {isMatching ? 'Matching...' : 'Match Receipt'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}; 