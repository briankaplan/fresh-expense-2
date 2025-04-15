export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  merchant: string;
  userId: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  url: string;
  expenseId?: string;
  userId: string;
  status: 'pending' | 'processed' | 'failed';
  metadata: {
    merchant?: string;
    amount?: number;
    date?: string;
    items?: Array<{
      description: string;
      amount: number;
      quantity: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  institution: string;
  userId: string;
  lastSync?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  nextBillingDate: string;
  provider: string;
  category: string;
  status: 'active' | 'cancelled' | 'paused';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
}
