export interface TransactionLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface TransactionMetadata {
  source: string;
  originalId?: string;
  rawData?: any;
  processedAt?: Date;
  confidence?: number;
  tags?: string[];
  notes?: string;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  merchantId?: string;
  categoryId?: string;
  status?: string;
  tags?: string[];
}

export interface TransactionSearchQuery {
  text: string;
  fields?: string[];
  limit?: number;
  offset?: number;
}

export interface TransactionExportOptions {
  format: "csv" | "json" | "pdf";
  filters?: TransactionFilters;
  fields?: string[];
  includeMetadata?: boolean;
}

export interface TransactionStatistics {
  total: number;
  totalAmount: number;
  averageAmount: number;
  byCategory: Record<string, { count: number; amount: number }>;
  byMerchant: Record<string, { count: number; amount: number }>;
  byMonth: Record<string, { count: number; amount: number }>;
}
