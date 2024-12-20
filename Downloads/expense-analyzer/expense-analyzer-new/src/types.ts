export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'personal' | 'business';
  notes?: string;
  receiptId?: string;
}

export interface Receipt {
  id: string;
  url: string;
  date: string;
  merchant: string;
  total: number;
  tax?: number;
  category?: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: {
    currency: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'system';
  };
} 