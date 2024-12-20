'use client';

import { useState, useTransition } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '@/lib/format';
import { ArrowUpDown, Filter, Plus, Receipt } from 'lucide-react';

export default function TransactionList() {
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    sortBy: 'transactionDate',
    sortOrder: 'desc'
  });

  const { data, isLoading } = useTransactions({ filters, pagination });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header with smooth blur effect */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/80 -mx-4 px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Transactions
        </h1>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Filter size={20} className="text-gray-600" />
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-primary-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-primary-600 transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Transaction</span>
          </motion.button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4 mt-6">
        <AnimatePresence mode="popLayout">
          {data?.data.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-gray-900 truncate">
                      {transaction.merchant}
                    </span>
                    {transaction.hasReceipt && (
                      <Receipt size={16} className="text-primary-500" />
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {formatDate(transaction.transactionDate)}
                    {transaction.category && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {transaction.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'expense' ? 'text-gray-900' : 'text-success'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Infinite Scroll Trigger */}
      {!isLoading && data?.pagination.hasMore && (
        <div className="py-4 text-center">
          <button
            onClick={() => {
              startTransition(() => {
                setPagination(p => ({ ...p, page: p.page + 1 }));
              });
            }}
            disabled={isPending}
            className="text-primary-500 hover:text-primary-600 transition-colors"
          >
            {isPending ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
} 