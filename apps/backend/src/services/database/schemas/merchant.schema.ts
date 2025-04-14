import { BaseSchema } from './base.schema';

export interface MerchantSchema extends BaseSchema {
  name: string;
  category: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  metadata?: {
    [key: string]: any;
  };
  isActive: boolean;
  lastTransactionDate?: Date;
  transactionCount: number;
  averageTransactionAmount?: number;
}

export const MERCHANT_COLLECTION = 'merchants'; 