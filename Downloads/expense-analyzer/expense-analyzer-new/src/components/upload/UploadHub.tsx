'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Receipt, Calculator, Plus, X } from 'lucide-react';
import { BankStatementUploader } from './BankStatementUploader';
import { ExpensifyUploader } from './ExpensifyUploader';
import { ManualExpenseForm } from './ManualExpenseForm';
import { BatchReceiptUploader } from './BatchReceiptUploader';
import { toast } from 'react-hot-toast';
import { useGestures } from '@/hooks/useGestures';

type UploadType = 'bank' | 'expensify' | 'manual' | 'receipts' | null;

export const UploadHub = () => {
  const [activeUpload, setActiveUpload] = useState<UploadType>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Gesture support for mobile
  const gestureHandlers = useGestures({
    onSwipeDown: () => activeUpload && setActiveUpload(null),
    onSwipeUp: () => !activeUpload && setActiveUpload('manual')
  });

  const uploadOptions = [
    {
      type: 'bank',
      icon: Calculator,
      title: 'Bank Statement',
      description: 'Upload bank transactions CSV',
      color: 'bg-primary-500',
      shortcut: '⌘B'
    },
    {
      type: 'expensify',
      icon: FileText,
      title: 'Expensify Export',
      description: 'Import from Expensify',
      color: 'bg-green-500',
      shortcut: '⌘E'
    },
    {
      type: 'manual',
      icon: Plus,
      title: 'Manual Expense',
      description: 'Add expense manually',
      color: 'bg-purple-500',
      shortcut: '⌘M'
    },
    {
      type: 'receipts',
      icon: Receipt,
      title: 'Batch Receipts',
      description: 'Upload multiple receipts',
      color: 'bg-amber-500',
      shortcut: '⌘R'
    }
  ] as const;

  const handleUploadComplete = async (type: UploadType, data: any) => {
    try {
      setIsProcessing(true);
      
      // Process based on type
      switch (type) {
        case 'bank':
          await handleBankStatement(data);
          break;
        case 'expensify':
          await handleExpensifyImport(data);
          break;
        case 'manual':
          await handleManualExpense(data);
          break;
        case 'receipts':
          await handleBatchReceipts(data);
          break;
      }

      const messages = {
        bank: 'Bank statement processed successfully',
        expensify: 'Expensify data imported',
        manual: 'Expense added successfully',
        receipts: `${data.length} receipts processed`
      };

      toast.success(messages[type] || 'Upload complete', {
        duration: 3000,
        icon: '✅'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.', {
        duration: 4000,
        icon: '❌'
      });
    } finally {
      setIsProcessing(false);
      setActiveUpload(null);
    }
  };

  return (
    <div className="space-y-6" {...gestureHandlers}>
      {/* Upload Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {uploadOptions.map(({ type, icon: Icon, title, description, color, shortcut }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveUpload(type as UploadType)}
            className={`
              relative p-6 rounded-xl border border-gray-100 bg-white
              flex flex-col items-center text-center gap-4
              transition-shadow hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            `}
          >
            <div className={`
              p-3 rounded-full ${color} text-white
              flex items-center justify-center
            `}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
              <span className="mt-2 inline-block text-xs text-gray-400">
                {shortcut}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Active Upload Component */}
      <AnimatePresence mode="wait">
        {activeUpload && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-xl border border-gray-100 p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {uploadOptions.find(opt => opt.type === activeUpload)?.title}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveUpload(null)}
                className="text-gray-400 hover:text-gray-500 p-1"
              >
                <span className="sr-only">Close</span>
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="relative">
              {activeUpload === 'bank' && (
                <BankStatementUploader
                  onUpload={(data) => handleUploadComplete('bank', data)}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}

              {activeUpload === 'expensify' && (
                <ExpensifyUploader
                  onUpload={(data) => handleUploadComplete('expensify', data)}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}

              {activeUpload === 'manual' && (
                <ManualExpenseForm
                  onSubmit={(data) => handleUploadComplete('manual', data)}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}

              {activeUpload === 'receipts' && (
                <BatchReceiptUploader
                  onUpload={(data) => handleUploadComplete('receipts', data)}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
              <p className="text-gray-900 font-medium">Processing...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 