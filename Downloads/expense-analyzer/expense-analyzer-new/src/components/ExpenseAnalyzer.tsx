'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Upload, FileSpreadsheet, Receipt, Calculator, 
  ArrowUpDown, Filter, PieChart, X 
} from 'lucide-react';
import { ExpenseTable } from '@/components/ExpenseTable';
import { ManualExpenseForm } from '@/components/ManualExpenseForm';
import { MatchingSection } from '@/components/MatchingSection';
import { StatsCards } from '@/components/StatsCards';
import { toast } from 'react-hot-toast';
import { Transaction, Expense } from '@prisma/client';

interface ExpenseAnalyzerProps {
  initialTransactions: Transaction[];
  initialExpenses: Expense[];
}

export function ExpenseAnalyzer({ initialTransactions, initialExpenses }: ExpenseAnalyzerProps) {
  const [activeView, setActiveView] = useState<'expenses' | 'matching'>('expenses');
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotal(newTotal);
  }, [expenses]);

  const handleClear = () => {
    setExpenses([]);
    setTotal(0);
    toast.success('All expenses cleared');
  };

  const handleFileUpload = async (files: FileList | null, type: 'bank' | 'expensify' | 'receipts') => {
    if (!files?.length) return;

    const maxSize = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '10485760');
    
    // Check file sizes
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return;
      }
    }

    setIsUploading(true);
    const loadingToast = toast.loading('Processing files...');

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/upload/${type}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Upload failed');
      }

      const data = await response.json();
      setExpenses(prev => [...prev, ...data.results]);
      
      setShowUploadMenu(false);
      toast.success('Files processed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleUpdateExpense = async (expenseId: string, update: Partial<Expense>) => {
    try {
      // Update in database
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      const updatedExpense = await response.json();

      // Update local state
      setExpenses(current =>
        current.map(expense =>
          expense.id === expenseId
            ? { ...expense, ...updatedExpense }
            : expense
        )
      );

      toast.success('Expense updated successfully');
    } catch (error) {
      console.error('Failed to update expense:', error);
      toast.error('Failed to update expense');
    }
  };

  const handleUploadReceipt = async (expenseId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expenseId', expenseId);

      const response = await fetch('/api/upload/receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload receipt');
      }

      const updatedExpense = await response.json();

      // Update local state
      setExpenses(current =>
        current.map(expense =>
          expense.id === expenseId
            ? { ...expense, hasReceipt: true, receiptUrl: updatedExpense.receiptUrl }
            : expense
        )
      );

      toast.success('Receipt uploaded successfully');
    } catch (error) {
      console.error('Failed to upload receipt:', error);
      toast.error('Failed to upload receipt');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-40">
        <div className="flex justify-around p-2">
          <button
            onClick={() => setActiveView('expenses')}
            className={`flex flex-col items-center p-2 rounded-xl ${
              activeView === 'expenses' ? 'text-primary-500' : 'text-gray-500'
            }`}
          >
            <PieChart className="w-6 h-6" />
            <span className="text-xs mt-1">Expenses</span>
          </button>
          <button
            onClick={() => setActiveView('matching')}
            className={`flex flex-col items-center p-2 rounded-xl ${
              activeView === 'matching' ? 'text-primary-500' : 'text-gray-500'
            }`}
          >
            <ArrowUpDown className="w-6 h-6" />
            <span className="text-xs mt-1">Match</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Expense Analyzer
            </h1>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-900"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Filter</span>
              </motion.button>
            </div>
          </header>

          {/* Add Clear Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Expense Analyzer</h1>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Stats Cards */}
          <StatsCards 
            transactions={initialTransactions} 
            expenses={expenses}
            total={total}
          />

          {/* Content Views */}
          <div className="grid grid-cols-1 gap-8">
            {activeView === 'expenses' ? (
              <ExpenseTable 
                expenses={expenses} 
                onUploadReceipt={handleUploadReceipt}
                onUpdateExpense={handleUpdateExpense}
              />
            ) : (
              <MatchingSection />
            )}
          </div>
        </div>
      </main>

      {/* Upload FAB */}
      <div className="fixed bottom-20 right-4 md:bottom-8 z-30">
        <AnimatePresence>
          {showUploadMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-72 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900">Add Expense</h3>
                <button
                  onClick={() => setShowUploadMenu(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {/* Bank Statement Upload */}
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Bank Statement</p>
                    <p className="text-xs text-gray-500">Upload CSV file</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'bank')}
                    disabled={isUploading}
                  />
                </label>

                {/* Expensify Upload */}
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Expensify</p>
                    <p className="text-xs text-gray-500">Import from Expensify</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'expensify')}
                    disabled={isUploading}
                  />
                </label>

                {/* Receipt Upload */}
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Receipts</p>
                    <p className="text-xs text-gray-500">Upload receipt images</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'receipts')}
                    disabled={isUploading}
                  />
                </label>

                {/* Manual Entry */}
                <button
                  onClick={() => {
                    setShowUploadMenu(false);
                    setShowManualForm(true);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 w-full"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">Manual Entry</p>
                    <p className="text-xs text-gray-500">Add expense manually</p>
                  </div>
                </button>
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowUploadMenu(!showUploadMenu)}
          className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-full shadow-lg 
                     flex items-center justify-center transform hover:shadow-xl transition-all duration-200
                     hover:from-blue-600 hover:to-indigo-700"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </div>

      {/* Manual Expense Form Modal */}
      <AnimatePresence>
        {showManualForm && (
          <ManualExpenseForm onClose={() => setShowManualForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
} 