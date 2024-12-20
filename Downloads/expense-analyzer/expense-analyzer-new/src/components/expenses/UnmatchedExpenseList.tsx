'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, AlertCircle } from 'lucide-react';
import { Expense } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';

interface UnmatchedExpenseListProps {
  expenses: Expense[];
  onExpenseSelect: (expense: Expense) => void;
}

export const UnmatchedExpenseList: React.FC<UnmatchedExpenseListProps> = ({
  expenses,
  onExpenseSelect
}) => {
  const unmatchedExpenses = expenses.filter(expense => !expense.receiptId);

  if (unmatchedExpenses.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          No Unmatched Expenses
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          All expenses have been matched with receipts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 
                    dark:bg-amber-900/20 p-3 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <p className="text-sm">
          {unmatchedExpenses.length} expense{unmatchedExpenses.length !== 1 ? 's' : ''} without receipts
        </p>
      </div>

      {unmatchedExpenses.map((expense, index) => (
        <motion.div
          key={expense.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onExpenseSelect(expense)}
          className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg 
                   shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <h4 className="text-sm font-medium">{expense.description}</h4>
              <span className="text-sm font-semibold">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span>{formatDateDisplay(new Date(expense.date))}</span>
              <span className="mx-2">•</span>
              <span>{expense.category}</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{expense.type}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 