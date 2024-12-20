'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Receipt, FileText, Check, X } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
}

interface UnmatchedReceipt {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  imageUrl: string;
}

export function MatchingSection() {
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>({
    id: '1',
    date: '2024-03-20',
    description: 'Coffee Shop Purchase',
    amount: 12.99,
  });

  const [suggestedReceipts, setSuggestedReceipts] = useState<UnmatchedReceipt[]>([
    {
      id: '1',
      date: '2024-03-20',
      merchant: 'Local Coffee Shop',
      amount: 12.99,
      imageUrl: '/receipt-1.jpg',
    },
    // Add more suggested receipts
  ]);

  const handleMatch = (receiptId: string) => {
    // Handle matching logic
    console.log('Matched:', receiptId);
  };

  const handleSkip = () => {
    // Handle skip logic
    console.log('Skipped');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Current Transaction */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Match Receipts</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSkip}
            className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-50"
          >
            Skip
          </motion.button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{currentTransaction.description}</h3>
              <p className="text-sm text-gray-500">
                ${currentTransaction.amount} • {new Date(currentTransaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Matches */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Suggested Matches</h3>
          
          <AnimatePresence>
            {suggestedReceipts.map((receipt) => (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{receipt.merchant}</h4>
                      <p className="text-sm text-gray-500">
                        ${receipt.amount} • {new Date(receipt.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMatch(receipt.id)}
                      className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200"
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 