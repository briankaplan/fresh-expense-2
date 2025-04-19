import { ApiError, ExpenseCategory } from '@fresh-expense/types';
import { formatCurrency } from '@/utils/format';
import api from './api';

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
  company: 'Down Home' | 'Music City Rodeo' | 'Personal';
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
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ExpenseResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

class ExpenseService {
  private static instance: ExpenseService;
  private baseUrl = '/api/expenses';

  private constructor() {}

  public static getInstance(): ExpenseService {
    if (!ExpenseService.instance) {
      ExpenseService.instance = new ExpenseService();
    }
    return ExpenseService.instance;
  }

  async getExpenses(filters: ExpenseFilter): Promise<PaginatedExpenses> {
    const response = await api.get<PaginatedExpenses>(this.baseUrl, { params: filters });
    return response.data;
  }

  async getExpense(id: string): Promise<Expense> {
    const response = await api.get<Expense>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createExpense(expense: Omit<Expense, 'id' | 'status'>): Promise<Expense> {
    const response = await api.post<Expense>(this.baseUrl, expense);
    return response.data;
  }

  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    const response = await api.patch<Expense>(`${this.baseUrl}/${id}`, expense);
    return response.data;
  }

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async bulkDeleteExpenses(ids: string[]): Promise<void> {
    await api.post(`${this.baseUrl}/bulk-delete`, { ids });
  }

  async bulkUpdateExpenses(ids: string[], updates: Partial<Expense>): Promise<Expense[]> {
    const response = await api.patch<Expense[]>(`${this.baseUrl}/bulk-update`, {
      ids,
      updates,
    });
    return response.data;
  }

  async bulkAddLabel(ids: string[], label: string): Promise<Expense[]> {
    const response = await api.post<Expense[]>(`${this.baseUrl}/bulk-label`, {
      ids,
      label,
    });
    return response.data;
  }

  async bulkShareExpenses(ids: string[]): Promise<{ shareUrl: string }> {
    const response = await api.post<{ shareUrl: string }>(`${this.baseUrl}/bulk-share`, {
      ids,
    });
    return response.data;
  }

  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>(`${this.baseUrl}/categories`);
    return response.data;
  }

  async getMerchants(): Promise<string[]> {
    const response = await api.get<string[]>(`${this.baseUrl}/merchants`);
    return response.data;
  }

  async exportExpenses(format: 'csv' | 'excel' | 'pdf', filters?: ExpenseFilter): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/export`, {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  }

  async getExpenseSummary(filters: ExpenseFilters = {}): Promise<{
    total: number;
    byCategory: Record<ExpenseCategory, number>;
    byMonth: Record<string, number>;
  }> {
    try {
      const response = await api.get<{
        total: number;
        byCategory: Record<ExpenseCategory, number>;
        byMonth: Record<string, number>;
      }>(`${this.baseUrl}/summary`, { params: filters });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Failed to fetch expense summary');
    }
  }
}

export default ExpenseService;
