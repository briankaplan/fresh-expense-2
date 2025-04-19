import type { ExpenseCategory } from "@fresh-expense/types";
export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: ExpenseCategory;
  merchant: string;
  receiptUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  company: "Down Home" | "Music City Rodeo" | "Personal";
  aiSuggestions?: {
    category?: string;
    description?: string;
    tags?: string[];
  };
  status: string;
}
export interface CreateExpenseData {
  amount: number;
  date: string;
  description: string;
  category: ExpenseCategory;
  merchant: string;
  receiptUrl?: string;
}
export interface UpdateExpenseData extends Partial<CreateExpenseData> {}
export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
  merchant?: string;
  minAmount?: number;
  maxAmount?: number;
}
export interface PaginatedExpenses {
  items: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface ExpenseFilter {
  search?: string;
  category?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
export interface ExpenseResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}
declare class ExpenseService {
  private static instance;
  private baseUrl;
  private constructor();
  static getInstance(): ExpenseService;
  getExpenses(filters: ExpenseFilter): Promise<PaginatedExpenses>;
  getExpense(id: string): Promise<Expense>;
  createExpense(expense: Omit<Expense, "id" | "status">): Promise<Expense>;
  updateExpense(id: string, expense: Partial<Expense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  bulkDeleteExpenses(ids: string[]): Promise<void>;
  bulkUpdateExpenses(ids: string[], updates: Partial<Expense>): Promise<Expense[]>;
  bulkAddLabel(ids: string[], label: string): Promise<Expense[]>;
  bulkShareExpenses(ids: string[]): Promise<{
    shareUrl: string;
  }>;
  getCategories(): Promise<string[]>;
  getMerchants(): Promise<string[]>;
  exportExpenses(format: "csv" | "excel" | "pdf", filters?: ExpenseFilter): Promise<Blob>;
  getExpenseSummary(filters?: ExpenseFilters): Promise<{
    total: number;
    byCategory: Record<ExpenseCategory, number>;
    byMonth: Record<string, number>;
  }>;
}
export default ExpenseService;
//# sourceMappingURL=expense.service.d.ts.map
