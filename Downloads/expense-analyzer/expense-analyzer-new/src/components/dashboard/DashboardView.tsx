'use client';

import React from 'react';
import { Expense } from '@/types';

interface DashboardViewProps {
  expenses: Expense[];
}

export function DashboardView({ expenses }: DashboardViewProps) {
  return (
    <div>
      <h2>Recent Expenses</h2>
      <pre>{JSON.stringify(expenses, null, 2)}</pre>
    </div>
  );
} 