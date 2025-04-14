export interface ProcessedData {
  merchant: string;
  date: Date | undefined;
  amount: number;
  items?: string[];
  verification?: {
    score: number;
    merchantMatch: boolean;
    amountMatch: boolean;
    dateMatch: boolean;
    itemsMatch?: boolean;
    isMatch: boolean;
    merchantScore: number;
    amountScore: number;
    dateScore: number;
    itemsScore?: number;
    details: {
      transactionId?: string;
      paymentMethod?: string;
      tax?: number;
    };
  };
} 