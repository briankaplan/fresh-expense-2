'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { db } from '@/lib/db';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await db.expenses.getAll();
      setExpenses(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = await db.expenses.create(expense);
    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    const updatedExpense = await db.expenses.update(id, expense);
    setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));
    return updatedExpense;
  };

  const deleteExpense = async (id: string) => {
    await db.expenses.delete(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: loadExpenses,
  };
} 