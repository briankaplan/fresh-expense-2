'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '../common/Form';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Expense } from '@/types';
import { categories } from '@/config/categories';

const expenseSchema = z.object({
  date: z.string(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['personal', 'business']),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense || {
      date: new Date().toISOString().split('T')[0],
      type: 'personal',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  const categoryOptions = Object.entries(categories).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? 'Edit Expense' : 'Add Expense'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Date"
          name="date"
          type="date"
          form={form}
        />

        <FormField
          label="Description"
          name="description"
          form={form}
          placeholder="Enter expense description"
        />

        <FormField
          label="Amount"
          name="amount"
          type="number"
          form={form}
          placeholder="0.00"
        />

        <FormField
          label="Category"
          name="category"
          type="select"
          form={form}
          options={categoryOptions}
        />

        <FormField
          label="Type"
          name="type"
          type="select"
          form={form}
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'business', label: 'Business' },
          ]}
        />

        <FormField
          label="Notes"
          name="notes"
          type="textarea"
          form={form}
          placeholder="Add any additional notes"
        />

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {expense ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 