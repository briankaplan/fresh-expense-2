'use client';

import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface Split {
  name: string;
  amount: number;
  percentage: number;
}

interface SplitExpenseModalProps {
  isOpen: boolean;
  totalAmount: number;
  onClose: () => void;
  onSplit: (splits: Split[]) => void;
}

export const SplitExpenseModal: React.FC<SplitExpenseModalProps> = ({
  isOpen,
  totalAmount,
  onClose,
  onSplit
}) => {
  const [splits, setSplits] = useState<Split[]>([
    { name: '', amount: 0, percentage: 100 }
  ]);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addSplit = () => {
    if (splits.length >= 10) {
      setError('Maximum 10 splits allowed');
      return;
    }
    setSplits([...splits, { name: '', amount: 0, percentage: 0 }]);
    setError(null);
  };

  const removeSplit = (index: number) => {
    if (splits.length <= 1) {
      setError('At least one split is required');
      return;
    }
    const newSplits = splits.filter((_, i) => i !== index);
    setSplits(newSplits);
    setError(null);
  };

  const updateSplit = (index: number, field: keyof Split, value: string | number) => {
    const newSplits = [...splits];
    if (field === 'percentage') {
      newSplits[index].percentage = Number(value);
      newSplits[index].amount = (totalAmount * Number(value)) / 100;
    } else if (field === 'amount') {
      newSplits[index].amount = Number(value);
      newSplits[index].percentage = (Number(value) / totalAmount) * 100;
    } else {
      newSplits[index][field] = value as string;
    }
    setSplits(newSplits);
  };

  const handleSubmit = () => {
    // Validate splits
    const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError('Total percentage must equal 100%');
      return;
    }

    if (splits.some(split => !split.name)) {
      setError('All splits must have a name');
      return;
    }

    onSplit(splits);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Split Expense</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Total Amount: ${totalAmount.toFixed(2)}
          </p>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {splits.map((split, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Name"
                value={split.name}
                onChange={e => updateSplit(index, 'name', e.target.value)}
                className="flex-1 rounded-md border-gray-300"
              />
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={split.percentage}
                onChange={e => updateSplit(index, 'percentage', e.target.value)}
                className="w-20 rounded-md border-gray-300"
              />
              <span className="text-gray-500">%</span>
              <button
                onClick={() => removeSplit(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addSplit}
          className="mt-4 flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <Plus className="w-4 h-4" />
          Add Split
        </button>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Split Expense
          </button>
        </div>
      </div>
    </div>
  );
}; 