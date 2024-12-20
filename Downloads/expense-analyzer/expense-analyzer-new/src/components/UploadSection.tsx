import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface UploadSectionProps {
  onBankStatementUpload: (file: File) => Promise<void>;
  onExpensifyUpload: (file: File) => Promise<void>;
  onManualExpenseSubmit: (expense: ManualExpense) => Promise<void>;
}

interface ManualExpense {
  date: string;
  description: string;
  amount: number;
  category: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onBankStatementUpload,
  onExpensifyUpload,
  onManualExpenseSubmit,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualExpense, setManualExpense] = useState<ManualExpense>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'other',
  });

  const bankStatementRef = useRef<HTMLInputElement>(null);
  const expensifyRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, uploadHandler: (file: File) => Promise<void>) => {
    try {
      setIsUploading(true);
      await uploadHandler(file);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      await onManualExpenseSubmit(manualExpense);
      setShowManualForm(false);
      setManualExpense({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: 'other',
      });
    } catch (error) {
      console.error('Manual expense submission failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900">Add Expenses</h2>
      
      {/* Upload Buttons */}
      <div className="flex flex-wrap gap-4">
        {/* Bank Statement Upload */}
        <div>
          <input
            ref={bankStatementRef}
            type="file"
            accept=".csv,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, onBankStatementUpload);
            }}
            className="hidden"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => bankStatementRef.current?.click()}
            disabled={isUploading}
            className="btn-primary"
          >
            {isUploading ? 'Uploading...' : 'Upload Bank Statement'}
          </motion.button>
        </div>

        {/* Expensify Upload */}
        <div>
          <input
            ref={expensifyRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, onExpensifyUpload);
            }}
            className="hidden"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => expensifyRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary"
          >
            {isUploading ? 'Uploading...' : 'Import Expensify CSV'}
          </motion.button>
        </div>

        {/* Manual Entry Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowManualForm(!showManualForm)}
          className="btn-secondary"
        >
          {showManualForm ? 'Cancel Manual Entry' : 'Add Manual Expense'}
        </motion.button>
      </div>

      {/* Manual Entry Form */}
      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={manualExpense.date}
                onChange={(e) => setManualExpense({ ...manualExpense, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                value={manualExpense.amount}
                onChange={(e) => setManualExpense({ ...manualExpense, amount: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={manualExpense.description}
                onChange={(e) => setManualExpense({ ...manualExpense, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={manualExpense.category}
                onChange={(e) => setManualExpense({ ...manualExpense, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="other">Other</option>
                <option value="food">Food & Dining</option>
                <option value="transportation">Transportation</option>
                <option value="utilities">Utilities</option>
                <option value="entertainment">Entertainment</option>
                <option value="shopping">Shopping</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isUploading}
              className="btn-primary"
            >
              {isUploading ? 'Saving...' : 'Save Expense'}
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}; 