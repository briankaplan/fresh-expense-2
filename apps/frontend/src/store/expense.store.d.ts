import { Expense, ExpenseFilters } from '../services/expense.service';
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
        createExpense: (data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
        updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
        deleteExpense: (id: string) => Promise<void>;
        fetchSummary: () => Promise<void>;
        clearError: () => void;
    };
}
declare const useExpenseStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<ExpenseState>, "setState"> & {
    setState<A extends string | {
        type: string;
    }>(partial: ExpenseState | Partial<ExpenseState> | ((state: ExpenseState) => ExpenseState | Partial<ExpenseState>), replace?: boolean | undefined, action?: A | undefined): void;
}, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<ExpenseState, {
            filters: ExpenseFilters;
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ExpenseState) => void) => () => void;
        onFinishHydration: (fn: (state: ExpenseState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<ExpenseState, {
            filters: ExpenseFilters;
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        }>>;
    };
}>;
export default useExpenseStore;
//# sourceMappingURL=expense.store.d.ts.map