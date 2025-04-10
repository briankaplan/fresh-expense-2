// User related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Auth related types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Expense related types
export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
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
  | 'healthcare'
  | 'shopping'
  | 'other';

// API related types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Common component props
export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

// Route related types
export interface ProtectedRouteProps {
  children: React.ReactNode;
} 