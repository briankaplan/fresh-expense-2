'use client';

import React from 'react';
import { DataTable } from '../common/DataTable';
import { Button } from '../common/Button';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';
import { Expense } from '@/types';
import { Plus, FileText } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onAddExpense,
  onEditExpense,
}) => {
  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (value) => formatDateDisplay(new Date(value as string))
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value) => formatCurrency(value as number)
    },
    {
      key: 'category',
      header: 'Category'
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => value === 'business' ? 'Business' : 'Personal'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Expenses</h2>
        <Button 
          onClick={onAddExpense}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Expense
        </Button>
      </div>

      <DataTable
        data={expenses}
        columns={columns}
        onRowClick={onEditExpense}
      />
    </div>
  );
}; 