export type MerchantSource = 'manual' | 'ocr' | 'transaction' | 'api';

export interface MerchantLearningData {
  merchantName: string;
  userId: string;
  source: MerchantSource;
  confidence: number;
  category?: string;
  metadata?: {
    transactionCount?: number;
    tags?: string[];
    [key: string]: any;
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
    [key: string]: any;
  };
}

export interface MerchantLearningConfig {
  minConfidence: number;
  minTransactions: number;
  categoryWeights: {
    [key in MerchantSource]: number;
  };
}
