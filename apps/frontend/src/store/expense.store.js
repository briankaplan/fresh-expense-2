"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const expense_service_1 = __importDefault(require("../services/expense.service"));
const useExpenseStore = (0, zustand_1.create)()((0, middleware_1.devtools)((0, middleware_1.persist)((set, get) => ({
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
        setFilters: (filters) => {
            set({ filters });
            get().actions.fetchExpenses();
        },
        setPagination: (page, limit) => {
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
                const response = await expense_service_1.default.getExpenses(get().filters, page, limit);
                set({
                    expenses: response.items,
                    pagination: {
                        page: response.page,
                        limit: response.limit,
                        total: response.total,
                        totalPages: response.totalPages,
                    },
                });
            }
            catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to fetch expenses' });
            }
            finally {
                set({ loading: false });
            }
        },
        fetchExpense: async (id) => {
            set({ loading: true, error: null });
            try {
                const expense = await expense_service_1.default.getExpense(id);
                set({ currentExpense: expense });
            }
            catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to fetch expense' });
            }
            finally {
                set({ loading: false });
            }
        },
        createExpense: async (data) => {
            set({ loading: true, error: null });
            try {
                await expense_service_1.default.createExpense(data);
                await get().actions.fetchExpenses();
                await get().actions.fetchSummary();
            }
            catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to create expense' });
            }
            finally {
                set({ loading: false });
            }
        },
        updateExpense: async (id, data) => {
            set({ loading: true, error: null });
            try {
                await expense_service_1.default.updateExpense(id, data);
                await get().actions.fetchExpenses();
                await get().actions.fetchSummary();
            }
            catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to update expense' });
            }
            finally {
                set({ loading: false });
            }
        },
        deleteExpense: async (id) => {
            set({ loading: true, error: null });
            try {
                await expense_service_1.default.deleteExpense(id);
                await get().actions.fetchExpenses();
                await get().actions.fetchSummary();
            }
            catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to delete expense' });
            }
            finally {
                set({ loading: false });
            }
        },
        fetchSummary: async () => {
            set({ loading: true, error: null });
            try {
                const summary = await expense_service_1.default.getExpenseSummary(get().filters);
                set({ summary });
            }
            catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to fetch summary' });
            }
            finally {
                set({ loading: false });
            }
        },
        clearError: () => set({ error: null }),
    },
}), {
    name: 'expense-storage',
    partialize: state => ({
        filters: state.filters,
        pagination: state.pagination,
    }),
})));
exports.default = useExpenseStore;
//# sourceMappingURL=expense.store.js.map