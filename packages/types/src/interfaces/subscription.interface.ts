export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  categoryId?: string;
  merchantId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 