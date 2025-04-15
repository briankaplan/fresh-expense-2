import { BaseSchema } from './base.schema';

export interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  totals: {
    income: number;
    expenses: number;
    net: number;
  };
  categories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  merchants: {
    name: string;
    amount: number;
    count: number;
  }[];
  subscriptions: {
    active: number;
    totalMonthly: number;
    upcoming: number;
  };
}

export interface ReportSchema extends BaseSchema {
  userId: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  data: ReportData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  metadata?: {
    [key: string]: any;
  };
}

export const REPORT_COLLECTION = 'reports';
