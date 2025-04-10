// Core types for the expense management application

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string; // ISO date string
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'food'
  | 'transportation'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'education'
  | 'other';

export interface CreateExpenseDto {
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
}

// We use type instead of interface to avoid the empty interface warning
export type UpdateExpenseDto = Partial<CreateExpenseDto>;

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
