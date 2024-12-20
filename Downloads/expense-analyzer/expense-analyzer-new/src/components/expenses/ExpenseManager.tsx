'use client';

import React, { useState } from 'react';
import { ExpenseList } from './ExpenseList';
import { ExpenseForm } from './ExpenseForm';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types';

export const ExpenseManager: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const { expenses, addExpense, updateExpense } = useExpenses();

  const handleAddExpense = () => {
    setSelectedExpense(undefined);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Omit<Expense, 'id'>) => {
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, data);
      } else {
        await addExpense(data);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to save expense:', error);
      // TODO: Add error handling
    }
  };

  return (
    <div className="space-y-6">
      <ExpenseList
        expenses={expenses}
        onAddExpense={handleAddExpense}
        onEditExpense={handleEditExpense}
      />

      <ExpenseForm
        expense={selectedExpense}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}; 