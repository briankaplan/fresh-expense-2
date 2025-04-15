import { BaseSchema } from './base.schema';

export interface BudgetCategory {
  categoryId: string;
  amount: number;
  spent: number;
}

export interface BudgetSchema extends BaseSchema {
  userId: string;
  name: string;
  description?: string;
  period: {
    start: Date;
    end: Date;
  };
  totalAmount: number;
  categories: BudgetCategory[];
  status: 'active' | 'completed' | 'archived';
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  metadata?: {
    [key: string]: any;
  };
}

export const BUDGET_COLLECTION = 'budgets';
