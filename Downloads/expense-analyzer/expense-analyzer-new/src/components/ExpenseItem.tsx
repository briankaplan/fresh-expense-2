'use client';

import React from 'react';
import { Expense } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';

interface ExpenseItemProps {
  expense: Expense;
  onMatchAttempt?: () => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onMatchAttempt }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{expense.merchant}</h4>
          <p className="text-sm text-gray-500">{expense.description}</p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="text-gray-900 font-medium">
              {formatCurrency(expense.amount)}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {formatDateDisplay(new Date(expense.date))}
            </span>
          </div>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {expense.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};