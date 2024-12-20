'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BankTransaction, Expense, ProcessedReceipt } from '@/types';
import { transactionService } from '@/services/db/transactionService';
import { receiptService } from '@/services/db/receiptService';
import { findPotentialMatches } from '@/services/expenseMatching';
import { formatDate } from '@/utils/dateUtils';

interface ReceiptUpdate {
  receiptUrl: string;
  merchant: string;
  amount: number;
  date: string;
  category?: string;
  notes?: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  tax?: number;
  tip?: number;
}

interface ReportFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  categories?: string[];
  merchants?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  hasReceipt?: boolean;
  isReconciled?: boolean;
  isPersonal?: boolean;
  isBusiness?: boolean;
}

interface ReportStats {
  totalAmount: number;
  businessAmount: number;
  personalAmount: number;
  receiptCount: number;
  unmatchedCount: number;
  categoryBreakdown: Record<string, number>;
  merchantBreakdown: Record<string, number>;
  monthlyTotals: Record<string, number>;
}

interface ReportStore {
  // State
  isLoading: boolean;
  error: string | null;
  bankTransactions: BankTransaction[];
  unmatched: Expense[];
  filters: ReportFilters;
  selectedTransactionId: string | null;
  
  // Metadata
  lastSync: string | null;
  totalCount: number;
  businessTotal: number;
  personalTotal: number;
  receiptCount: number;
  
  // Enhanced stats
  stats: ReportStats;
  
  // Actions
  loadTransactions: (filters?: ReportFilters) => Promise<void>;
  updateTransactionReceipt: (transactionId: string, update: ReceiptUpdate) => Promise<void>;
  matchExpenseToTransaction: (expenseId: string, transactionId: string) => Promise<void>;
  reconcileTransaction: (transactionId: string, isReconciled: boolean) => Promise<void>;
  categorizeTransactions: (transactionIds: string[], category: string) => Promise<void>;
  bulkUpdateReceipts: (updates: Array<{ id: string } & ReceiptUpdate>) => Promise<void>;
  exportReport: (format: 'csv' | 'pdf' | 'excel') => Promise<string>;
  generateStats: () => Promise<ReportStats>;
  splitTransaction: (
    transactionId: string,
    splits: Array<{ amount: number; category: string; description?: string }>
  ) => Promise<void>;
  mergeTransactions: (transactionIds: string[]) => Promise<void>;
  flagTransaction: (transactionId: string, flag: 'review' | 'dispute' | 'pending') => Promise<void>;
  addNote: (transactionId: string, note: string) => Promise<void>;
  attachTags: (transactionId: string, tags: string[]) => Promise<void>;
  
  // Filters
  setFilters: (filters: ReportFilters) => void;
  clearFilters: () => void;
  
  // Selection
  selectTransaction: (id: string | null) => void;
  getSelectedTransaction: () => BankTransaction | null;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      bankTransactions: [],
      unmatched: [],
      filters: {},
      selectedTransactionId: null,
      lastSync: null,
      totalCount: 0,
      businessTotal: 0,
      personalTotal: 0,
      receiptCount: 0,
      stats: {
        totalAmount: 0,
        businessAmount: 0,
        personalAmount: 0,
        receiptCount: 0,
        unmatchedCount: 0,
        categoryBreakdown: {},
        merchantBreakdown: {},
        monthlyTotals: {}
      },

      loadTransactions: async (filters) => {
        try {
          set({ isLoading: true, error: null });
          
          const transactions = await transactionService.getTransactions(filters);
          const unmatched = await transactionService.getUnmatchedExpenses();
          
          // Calculate totals
          const totals = transactions.reduce(
            (acc, tx) => ({
              total: acc.total + tx.amount,
              business: acc.business + (tx.isBusiness ? tx.amount : 0),
              personal: acc.personal + (tx.isPersonal ? tx.amount : 0),
              receipts: acc.receipts + (tx.hasReceipt ? 1 : 0)
            }),
            { total: 0, business: 0, personal: 0, receipts: 0 }
          );

          set({
            bankTransactions: transactions,
            unmatched,
            totalCount: transactions.length,
            businessTotal: totals.business,
            personalTotal: totals.personal,
            receiptCount: totals.receipts,
            lastSync: new Date().toISOString(),
            filters: filters || {}
          });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to load transactions' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      updateTransactionReceipt: async (transactionId, update) => {
        try {
          set({ isLoading: true, error: null });
          
          // Update receipt in database
          await receiptService.updateReceipt(transactionId, update);
          
          // Update local state
          const { bankTransactions } = get();
          set({
            bankTransactions: bankTransactions.map(tx =>
              tx.id === transactionId ? {
                ...tx,
                hasReceipt: true,
                receiptUrl: update.receiptUrl,
                merchant: update.merchant || tx.merchant,
                amount: update.amount,
                date: formatDate(update.date),
                category: update.category || tx.category,
                notes: update.notes || tx.notes
              } : tx
            )
          });

          // Check for potential matches
          const updatedTransaction = get().bankTransactions.find(tx => tx.id === transactionId);
          if (updatedTransaction) {
            const matches = findPotentialMatches(updatedTransaction, get().unmatched);
            if (matches.length > 0) {
              // Handle potential matches
              await get().matchExpenseToTransaction(matches[0].expense.id, transactionId);
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update receipt' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      matchExpenseToTransaction: async (expenseId, transactionId) => {
        try {
          set({ isLoading: true, error: null });
          
          await transactionService.matchExpenseToTransaction(expenseId, transactionId);
          
          // Update local state
          const { bankTransactions, unmatched } = get();
          const matchedExpense = unmatched.find(e => e.id === expenseId);
          
          if (matchedExpense) {
            set({
              bankTransactions: bankTransactions.map(tx =>
                tx.id === transactionId ? {
                  ...tx,
                  matchedExpenseId: expenseId,
                  isReconciled: true,
                  hasReceipt: !!matchedExpense.receiptUrl,
                  receiptUrl: matchedExpense.receiptUrl,
                  category: matchedExpense.category || tx.category
                } : tx
              ),
              unmatched: unmatched.filter(e => e.id !== expenseId)
            });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to match expense' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      generateStats: async () => {
        const { bankTransactions, filters } = get();
        const filteredTransactions = bankTransactions.filter(tx => {
          if (filters.dateRange) {
            const txDate = new Date(tx.date);
            const start = new Date(filters.dateRange.startDate);
            const end = new Date(filters.dateRange.endDate);
            if (txDate < start || txDate > end) return false;
          }
          // ... apply other filters ...
          return true;
        });

        const stats: ReportStats = {
          totalAmount: 0,
          businessAmount: 0,
          personalAmount: 0,
          receiptCount: 0,
          unmatchedCount: 0,
          categoryBreakdown: {},
          merchantBreakdown: {},
          monthlyTotals: {}
        };

        filteredTransactions.forEach(tx => {
          stats.totalAmount += tx.amount;
          if (tx.isBusiness) stats.businessAmount += tx.amount;
          if (tx.isPersonal) stats.personalAmount += tx.amount;
          if (tx.hasReceipt) stats.receiptCount++;
          
          // Category breakdown
          stats.categoryBreakdown[tx.category] = 
            (stats.categoryBreakdown[tx.category] || 0) + tx.amount;
          
          // Merchant breakdown
          if (tx.merchant) {
            stats.merchantBreakdown[tx.merchant] = 
              (stats.merchantBreakdown[tx.merchant] || 0) + tx.amount;
          }
          
          // Monthly totals
          const monthKey = new Date(tx.date).toISOString().slice(0, 7);
          stats.monthlyTotals[monthKey] = 
            (stats.monthlyTotals[monthKey] || 0) + tx.amount;
        });

        return stats;
      },

      splitTransaction: async (transactionId, splits) => {
        try {
          set({ isLoading: true, error: null });
          
          const results = await transactionService.splitTransaction(transactionId, splits);
          
          const { bankTransactions } = get();
          const updatedTransactions = bankTransactions.filter(tx => 
            tx.id !== transactionId
          ).concat(results);
          
          set({ bankTransactions: updatedTransactions });
          
          // Recalculate stats
          const stats = await get().generateStats();
          set({ stats });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to split transaction' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // ... implement other actions ...

      setFilters: (filters) => {
        set({ filters });
        get().loadTransactions(filters);
      },

      clearFilters: () => {
        set({ filters: {} });
        get().loadTransactions();
      },

      selectTransaction: (id) => {
        set({ selectedTransactionId: id });
      },

      getSelectedTransaction: () => {
        const { bankTransactions, selectedTransactionId } = get();
        return bankTransactions.find(tx => tx.id === selectedTransactionId) || null;
      }
    }),
    {
      name: 'report-store',
      partialize: (state) => ({
        filters: state.filters,
        selectedTransactionId: state.selectedTransactionId
      })
    }
  )
); 