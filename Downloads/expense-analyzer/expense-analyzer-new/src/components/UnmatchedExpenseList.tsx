'use client';

import React from 'react';
import { Expense } from '@/types';
import { ExpenseItem } from './ExpenseItem';

interface UnmatchedExpenseListProps {
  expenses: Expense[];
  onExpenseSelect?: (expense: Expense) => void;
}

export const UnmatchedExpenseList: React.FC<UnmatchedExpenseListProps> = ({ 
  expenses,
  onExpenseSelect 
}) => {
  if (!expenses.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No unmatched expenses found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Unmatched Expenses</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expenses.map(expense => (
          <div 
            key={expense.id} 
            onClick={() => onExpenseSelect?.(expense)}
            className="cursor-pointer"
          >
            <ExpenseItem expense={expense} />
          </div>
        ))}
      </div>
    </div>
  );
};