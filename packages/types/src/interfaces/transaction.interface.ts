// Internal modules
import type { TransactionStatus, TransactionType, TransactionSource, TransactionCategory } from "../constants/transaction.constants";
import type { ExpenseCategory } from "../lib/types";
import type { BaseDocument } from "../schemas/base.schema";

export interface TransactionAmount {
  value: number;
  currency: string;
}

export interface TransactionMerchant {
  name: string;
  category?: string;
  website?: string;
  logo?: string;
}

export interface TransactionLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TransactionMetrics {
  monthlyAverage?: number;
  monthlyTotal?: number;
  yearlyAverage?: number;
  yearlyTotal?: number;
  frequency?: "one-time" | "recurring";
  trend?: "increasing" | "decreasing" | "stable";
}

export interface TransactionMetadata {
  source: string;
  originalId?: string;
  rawData?: Record<string, any>;
  processedAt?: Date;
  confidence?: number;
  tags?: string[];
  notes?: string;
}

export interface Transaction extends BaseDocument {
  userId: string;
  accountId: string;
  date: Date;
  amount: TransactionAmount;
  description: string;
  cleanDescription?: string;
  category: TransactionCategory;
  merchant: TransactionMerchant;
  tags: string[];
  status: TransactionStatus;
  type: TransactionType;
  source: TransactionSource;
  receipt?: {
    id: string;
    url: string;
  };
  metadata?: TransactionMetadata;
  notes?: string;
  location?: TransactionLocation;
  isRecurring?: boolean;
  recurringFrequency?: string;
  recurringEndDate?: Date;
}
