export interface ITransactionCategorizationService {
  categorizeTransactions(request: AICategorizationRequestDto): Promise<AICategorizationResponseDto>;
  applyCategorization(updates: TransactionUpdateDto[]): Promise<number>;
  validateConfidence(result: AICategorizationResponseDto, threshold?: number): boolean;
}

export interface CategorizationConfig {
  confidenceThreshold: number;
  maxBatchSize: number;
  autoApply: boolean;
  preserveExisting: boolean;
}

export interface CategorizationValidationRules {
  isValidConfidence(threshold: number): boolean;
}

export interface AICategorizationRequestDto {
  transactionIds: string[];
  confidenceThreshold?: number;
  autoApply?: boolean;
}

export interface AICategorizationResponseDto {
  results: AICategorizedTransactionDto[];
  totalProcessed: number;
  totalUpdated: number;
  averageConfidence: number;
}

export interface AICategorizedTransactionDto {
  transactionId: string;
  categorization: AICategorizationResultDto | null;
  wasUpdated: boolean;
  error?: string;
}

export interface AICategorizationResultDto {
  category: string;
  company: 'Down Home' | 'Music City Rodeo' | 'Personal';
  tags: string[];
  confidence: number;
  description: string;
}

export interface TransactionUpdateDto {
  transactionId: string;
  category: string;
  company: 'Down Home' | 'Music City Rodeo' | 'Personal';
  tags: string[];
  description: string;
  confidence: number;
}

export interface TransactionPatterns {
  frequency: number;
  averageAmount: number;
  isRecurring: boolean;
  lastTransaction?: Date;
  amountDeviation: number;
}

export interface MerchantData {
  category?: string;
  company?: 'Down Home' | 'Music City Rodeo' | 'Personal';
  confidence?: number;
  tags?: string[];
  description?: string;
}

export interface TransactionCategorizationEvent {
  transactionId: string;
  merchant: string;
  category: string;
  company: 'Down Home' | 'Music City Rodeo' | 'Personal';
  confidence: number;
  patterns: TransactionPatterns;
}

export interface TransactionCategorization {
  transactionId: string;
  category: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface TransactionCategorizationResult {
  success: boolean;
  message?: string;
  categorization?: TransactionCategorization;
  error?: string;
}
