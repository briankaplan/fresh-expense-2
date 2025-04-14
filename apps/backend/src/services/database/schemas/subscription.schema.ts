import { BaseSchema } from './base.schema';

export interface SubscriptionSchema extends BaseSchema {
  userId: string;
  merchantId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  paymentMethod: string;
  category: string;
  tags?: string[];
  notes?: string;
  metadata?: {
    [key: string]: any;
  };
}

export const SUBSCRIPTION_COLLECTION = 'subscriptions'; 