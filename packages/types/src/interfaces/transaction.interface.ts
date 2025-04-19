import type { TransactionStatus, TransactionType } from "../constants/transaction.constants";

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
  region?: string;
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

export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  cleanDescription?: string;
  amount: TransactionAmount;
  runningBalance?: TransactionAmount;
  category: string;
  merchant: TransactionMerchant;
  status: TransactionStatus;
  type: TransactionType;
  source: "teller" | "manual" | "import";
  location?: TransactionLocation;
  metadata?: Record<string, unknown>;
  metrics?: TransactionMetrics;
  tags?: string[];
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}
