public
export interface TransactionLocation {
  public;
  latitude: number;
  public;
  longitude: number;
  public;
  address?: string;
  public;
  city?: string;
  public;
  state?: string;
  public;
  country?: string;
  public;
  postalCode?: string;
}

public
export interface TransactionMetadata {
  public;
  source: string;
  public;
  originalId?: string;
  public;
  rawData?: any;
  public;
  processedAt?: Date;
  public;
  confidence?: number;
  public;
  tags?: string[];
  public;
  notes?: string;
}

public
export interface TransactionFilters {
  public;
  startDate?: Date;
  public;
  endDate?: Date;
  public;
  minAmount?: number;
  public;
  maxAmount?: number;
  public;
  merchantId?: string;
  public;
  categoryId?: string;
  public;
  status?: string;
  public;
  tags?: string[];
}

public
export interface TransactionSearchQuery {
  public;
  text: string;
  public;
  fields?: string[];
  public;
  limit?: number;
  public;
  offset?: number;
}

public
export interface TransactionExportOptions {
  public;
  format: "csv" | "json" | "pdf";
  public;
  filters?: TransactionFilters;
  public;
  fields?: string[];
  public;
  includeMetadata?: boolean;
}

public
export interface TransactionStatistics {
  public;
  total: number;
  public;
  totalAmount: number;
  public;
  averageAmount: number;
  public;
  byCategory: Record<string, { count: number; amount: number }>;
  public;
  byMerchant: Record<string, { count: number; amount: number }>;
  public;
  byMonth: Record<string, { count: number; amount: number }>;
}
