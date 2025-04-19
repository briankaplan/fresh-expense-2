import { MerchantData } from './transaction-categorization.interface';

export interface IMerchantLearningService {
  getMerchantData(merchantName: string): Promise<MerchantData>;
  learnFromTransaction(merchantName: string, data: Partial<MerchantData>): Promise<void>;
  getMerchantSuggestions(merchantName: string): Promise<MerchantData[]>;
}

export type MerchantSource = 'manual' | 'ocr' | 'transaction' | 'api';

export interface MerchantLearningConfig {
  minConfidence: number;
  minTransactions: number;
  categoryWeights: Record<MerchantSource, number>;
}

export interface MerchantLearningData {
  merchantName: string;
  userId: string;
  source: MerchantSource;
  confidence?: number;
  category?: string;
  metadata?: {
    transactionCount?: number;
    tags?: string[];
  };
}

export interface MerchantLearningResult {
  merchantName: string;
  userId: string;
  category: string;
  confidence: number;
  tags: string[];
  metadata: {
    transactionCount: number;
    source: MerchantSource;
    originalConfidence: number;
    lastUpdated: Date;
  };
}
