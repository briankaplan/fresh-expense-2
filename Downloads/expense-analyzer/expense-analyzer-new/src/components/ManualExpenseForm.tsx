'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ManualExpenseFormProps {
  onClose: () => void;
  onSubmit: (expense: ManualExpense) => Promise<void>;
}

interface ManualExpense {
  date: string;
  description: string;
  amount: number;
  category: string;
}

export function ManualExpenseForm({ onClose, onSubmit }: ManualExpenseFormProps) {
  const [expense, setExpense] = useState<ManualExpense>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'other',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(expense);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Manual Expense</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={expense.date}
              onChange={e => setExpense(prev => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={expense.description}
              onChange={e => setExpense(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              step="0.01"
              value={expense.amount}
              onChange={e => setExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              className="w-full rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={expense.category}
              onChange={e => setExpense(prev => ({ ...prev, category: e.target.value }))}
              className="w-full rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="other">Other</option>
              <option value="food">Food & Dining</option>
              <option value="transportation">Transportation</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
            >
              Save Expense
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 