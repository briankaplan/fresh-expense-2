export interface Search {
  id: string;
  userId: string;
  query: string;
  filters: {
    dateRange?: {
      start: Date;
      end: Date;
    };
    amountRange?: {
      min: number;
      max: number;
    };
    categories?: string[];
    merchants?: string[];
  };
  results: {
    transactions: string[];
    receipts: string[];
    merchants: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
