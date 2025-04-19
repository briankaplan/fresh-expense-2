import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Expense, ExpenseFilters, PaginatedExpenses } from '../services/expense.service';
import expenseService from '../services/expense.service';

interface ExpenseState {
  expenses: Expense[];
  currentExpense: Expense | null;
  filters: ExpenseFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  summary: {
    total: number;
    byCategory: Record<string, number>;
    byMonth: Record<string, number>;
  } | null;
  actions: {
    setFilters: (filters: ExpenseFilters) => void;
    setPagination: (page: number, limit: number) => void;
    fetchExpenses: () => Promise<void>;
    fetchExpense: (id: string) => Promise<void>;
    createExpense: (
      data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ) => Promise<void>;
    updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    fetchSummary: () => Promise<void>;
    clearError: () => void;
  };
}

const useExpenseStore = create<ExpenseState>()(
  devtools(
    persist(
      (set, get) => ({
        expenses: [],
        currentExpense: null,
        filters: {},
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
        loading: false,
        error: null,
        summary: null,
        actions: {
          setFilters: (filters: ExpenseFilters) => {
            set({ filters });
            get().actions.fetchExpenses();
          },
          setPagination: (page: number, limit: number) => {
            set(state => ({
              pagination: {
                ...state.pagination,
                page,
                limit,
              },
            }));
            get().actions.fetchExpenses();
          },
          fetchExpenses: async () => {
            set({ loading: true, error: null });
            try {
              const { page, limit } = get().pagination;
              const response = await expenseService.getExpenses(get().filters, page, limit);
              set({
                expenses: response.items,
                pagination: {
                  page: response.page,
                  limit: response.limit,
                  total: response.total,
                  totalPages: response.totalPages,
                },
              });
            } catch (error) {
              set({ error: error instanceof Error ? error.message : 'Failed to fetch expenses' });
            } finally {
              set({ loading: false });
            }
          },
          fetchExpense: async (id: string) => {
            set({ loading: true, error: null });
            try {
              const expense = await expenseService.getExpense(id);
              set({ currentExpense: expense });
            } catch (error) {
              set({ error: error instanceof Error ? error.message : 'Failed to fetch expense' });
            } finally {
              set({ loading: false });
            }
          },
          createExpense: async data => {
            set({ loading: true, error: null });
            try {
              await expenseService.createExpense(data);
              await get().actions.fetchExpenses();
              await get().actions.fetchSummary();
            } catch (error) {
              set({ error: error instanceof Error ? error.message : 'Failed to create expense' });
            } finally {
              set({ loading: false });
            }
          },
          updateExpense: async (id, data) => {
            set({ loading: true, error: null });
            try {
              await expenseService.updateExpense(id, data);
              await get().actions.fetchExpenses();
              await get().actions.fetchSummary();
            } catch (error) {
              set({ error: error instanceof Error ? error.message : 'Failed to update expense' });
            } finally {
              set({ loading: false });
            }
          },
          deleteExpense: async id => {
            set({ loading: true, error: null });
            try {
              await expenseService.deleteExpense(id);
              await get().actions.fetchExpenses();
              await get().actions.fetchSummary();
            } catch (error) {
              set({ error: error instanceof Error ? error.message : 'Failed to delete expense' });
            } finally {
              set({ loading: false });
            }
          },
          fetchSummary: async () => {
            set({ loading: true, error: null });
            try {
              const summary = await expenseService.getExpenseSummary(get().filters);
              set({ summary });
            } catch (error) {
              set({ error: error instanceof Error ? error.message : 'Failed to fetch summary' });
            } finally {
              set({ loading: false });
            }
          },
          clearError: () => set({ error: null }),
        },
      }),
      {
        name: 'expense-storage',
        partialize: state => ({
          filters: state.filters,
          pagination: state.pagination,
        }),
      }
    )
  )
);

export default useExpenseStore;
