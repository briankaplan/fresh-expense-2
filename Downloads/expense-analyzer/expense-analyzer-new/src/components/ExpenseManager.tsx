'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BankTransaction, Expense, ReconciledItem } from '@/types';
import { TransactionList } from './TransactionList';
import { UnmatchedExpenseList } from './UnmatchedExpenseList';
import { ReceiptMatcher } from '@/services/receiptMatching';
import { useGestures } from '@/hooks/useGestures';

interface ExpenseManagerProps {
  bankTransactions: BankTransaction[];
  onMatchTransaction: (id: string) => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  bankTransactions,
  onMatchTransaction,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reconciled, setReconciled] = useState<ReconciledItem[]>([]);
  const [activeView, setActiveView] = useState<'transactions' | 'unmatched'>('transactions');

  useGestures({
    onSwipeLeft: () => setActiveView('unmatched'),
    onSwipeRight: () => setActiveView('transactions')
  });

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* View Toggle */}
        <div className="flex p-1 gap-1 bg-gray-50 border-b border-gray-100">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('transactions')}
            className={`
              flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeView === 'transactions' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Transactions
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('unmatched')}
            className={`
              flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeView === 'unmatched' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Unmatched
          </motion.button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: activeView === 'transactions' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeView === 'transactions' ? 20 : -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {activeView === 'transactions' ? (
              <div className="p-6">
                <TransactionList
                  transactions={bankTransactions}
                  reconciledItems={reconciled}
                  onUploadReceipt={id => {
                    console.log('Upload receipt for:', id);
                  }}
                />
              </div>
            ) : (
              <div className="p-6 bg-gray-50">
                <UnmatchedExpenseList 
                  expenses={expenses.filter(expense => 
                    !reconciled.some(r => r.expenseId === expense.id)
                  )} 
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div>Current view: {activeView}</div>
    </div>
  );
};