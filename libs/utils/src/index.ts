import { Transaction, Analytics } from '@fresh-expense/types';

// Date utilities
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format.replace('YYYY', year.toString()).replace('MM', month).replace('DD', day);
}

// Currency utilities
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Transaction utilities
export function calculateRunningBalance(transactions: Transaction[]): Transaction[] {
  let balance = 0;
  return transactions
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(transaction => {
      balance += transaction.type === 'credit' ? transaction.amount : -transaction.amount;
      return {
        ...transaction,
        runningBalance: balance,
      };
    });
}

// Analytics utilities
export function calculateSpendingTrends(
  transactions: Transaction[],
  period: Analytics['period']
): Analytics['spendingByCategory'] {
  const categoryTotals = new Map<string, { amount: number; count: number }>();
  let totalSpent = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'debit') {
      transaction.category.forEach(category => {
        const current = categoryTotals.get(category) || { amount: 0, count: 0 };
        categoryTotals.set(category, {
          amount: current.amount + transaction.amount,
          count: current.count + 1,
        });
        totalSpent += transaction.amount;
      });
    }
  });

  return Array.from(categoryTotals.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    percentage: (data.amount / totalSpent) * 100,
    count: data.count,
  }));
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Error handling utilities
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Type guards
export function isTransaction(obj: unknown): obj is Transaction {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'accountId' in obj &&
    'date' in obj &&
    'amount' in obj &&
    'type' in obj
  );
}
