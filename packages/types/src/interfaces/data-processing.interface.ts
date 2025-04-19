export interface ProcessedData {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  data: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractedReceiptData {
  merchant: string;
  amount: number;
  date: Date;
  items?: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  tax?: number;
  total: number;
  paymentMethod?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface VerificationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}
