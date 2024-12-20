'use client';

import React, { useState } from 'react';
import { BankTransaction } from '@/types';

interface TransactionEditFormProps {
  transaction: BankTransaction;
  onSave: (updates: Partial<BankTransaction>) => void;
  onCancel: () => void;
}

export const TransactionEditForm: React.FC<TransactionEditFormProps> = ({
  transaction,
  onSave,
  onCancel
}) => {
  const [description, setDescription] = useState(transaction.description || '');
  const [category, setCategory] = useState(transaction.category || '');
  const [notes, setNotes] = useState(transaction.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      description, 
      category,
      notes 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            <option value="meals">Meals & Entertainment</option>
            <option value="travel">Travel</option>
            <option value="office">Office Supplies</option>
            <option value="software">Software & Services</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Add any additional notes..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
}; 