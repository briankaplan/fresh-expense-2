'use client';

import React from 'react';
import { Expense } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { Receipt, ArrowRightLeft } from 'lucide-react';

interface ExpenseItemProps {
  expense: Expense;
  onMatchAttempt?: () => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ 
  expense,
  onMatchAttempt
}) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{expense.merchant}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(expense.date), 'MMM d, yyyy')}
          </p>
          {expense.description && (
            <p className="text-sm text-gray-600 mt-1">
              {expense.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {formatCurrency(expense.amount)}
          </p>
          {expense.category && (
            <p className="text-sm text-gray-500 mt-1">
              {expense.category}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {expense.hasReceipt ? (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <Receipt className="w-4 h-4" />
              Has Receipt
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm text-yellow-600">
              <Receipt className="w-4 h-4" />
              Missing Receipt
            </span>
          )}
        </div>
        {onMatchAttempt && (
          <button
            onClick={onMatchAttempt}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Find Match
          </button>
        )}
      </div>
    </div>
  );
}; 