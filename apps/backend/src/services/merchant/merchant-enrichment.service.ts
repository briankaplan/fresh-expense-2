import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types } from 'mongoose';
import { HfInference } from '@huggingface/inference';
import { Transaction, TransactionDocument } from '../../schemas/transaction.schema';
import { Merchant, MerchantDocument } from '../../schemas/merchant.schema';
import { TRANSACTION_CATEGORIES, TransactionCategory } from '../../types/transaction.types';
import { NotificationService } from '../notification/notification.service';
import { TransactionService } from '../transaction/transaction.service';
import { v4 as uuidv4 } from 'uuid';
import { TransactionType, TransactionStatus, TransactionSource, TransactionCompany, TransactionReimbursementStatus } from '../../app/transactions/enums/transaction.enums';
import { RateLimiterService } from '../rate-limiter.service';
import { ErrorHandlerService, ErrorType } from '../error-handler.service';
import { LoggingService } from '../logging.service';
import { BaseService } from '../base.service';

interface TransactionData {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'pending' | 'posted' | 'canceled';
  category: string[];
  merchantName?: string;
  merchantCategory?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

interface TransactionAnalysis {
  amount: number;
  date: Date;
  category: string;
  description?: string;
}

interface SubscriptionInfo {
  isSubscription: boolean;
  frequency?: string;
  nextPaymentDate?: Date;
}

interface PurchaseHistory {
  amount: number;
  date: Date;
  category: string;
  description: string;
}

interface EnrichedData {
  category?: string;
  tags?: string[];
  subscription?: SubscriptionInfo;
  industry?: string;
  subIndustry?: string;
  businessType?: string;
  paymentMethods?: string[];
  returnsPolicy?: string;
  contactInfo?: {
    supportUrl?: string;
  };
  lastEnrichmentDate?: Date;
  enrichmentSource?: string;
}

interface MerchantData {
  name: string;
  category?: string;
  tags?: string[];
  aliases?: string[];
  subscription?: SubscriptionInfo;
  purchaseHistory?: PurchaseHistory;
  enrichedData?: EnrichedData;
}

interface EnrichedTransaction {
  id: string;
  amount: number;
  date: Date;
  description: string;
  category: string[];
  merchantName?: string;
  merchantCategory?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  enrichedData: {
    id: string;
    amount: number;
    date: Date;
    description: string;
    category: string;
  };
}

const VALID_CATEGORIES = new Set([
  'FOOD_AND_DINING',
  'GROCERIES',
  'SHOPPING',
  'ENTERTAINMENT',
  'TRAVEL',
  'TRANSPORTATION',
  'UTILITIES',
  'HOUSING',
  'HEALTHCARE',
  'INSURANCE',
  'PERSONAL_CARE',
  'EDUCATION',
  'GIFTS_AND_DONATIONS',
  'BUSINESS_SERVICES',
  'TAXES',
  'INVESTMENTS',
  'INCOME',
  'TRANSFER',
  'FEES_AND_CHARGES',
  'OTHER'
] as const);

type ValidCategory = typeof VALID_CATEGORIES extends Set<infer T> ? T : never;

const isValidCategory = (category: unknown): category is ValidCategory => {
  return typeof category === 'string' && VALID_CATEGORIES.has(category as ValidCategory);
};

const normalizeCategory = (category: string): TransactionCategory => {
  const normalized = category.toUpperCase().replace(/[^A-Z_]/g, '_') as TransactionCategory;
  return isTransactionCategory(normalized) ? normalized : 'OTHER';
};

const getCategoryDisplayName = (category: TransactionCategory): string => {
  return TRANSACTION_CATEGORIES[category];
};

const isTransactionCategory = (category: unknown): category is TransactionCategory => {
  return typeof category === 'string' && 
    Object.keys(TRANSACTION_CATEGORIES).includes(category.toUpperCase() as TransactionCategory);
};

const getTransactionCategoryFromDisplay = (displayValue: string): TransactionCategory => {
  const entry = Object.entries(TRANSACTION_CATEGORIES).find(([_, value]) => value === displayValue);
  return entry ? entry[0] as TransactionCategory : 'OTHER';
};

@Injectable()
export class MerchantEnrichmentService extends BaseService {
  protected logger: Logger;
  private hf!: HfInference;
  private initialized = false;

  constructor(
    notificationService: NotificationService,
    eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    private readonly rateLimiter: RateLimiterService,
    private readonly errorHandler: ErrorHandlerService,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Merchant.name) private readonly merchantModel: Model<MerchantDocument>,
    private readonly loggingService: LoggingService
  ) {
    super(notificationService, eventEmitter, MerchantEnrichmentService.name);
    this.logger = new Logger(MerchantEnrichmentService.name);
    const hfApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    if (hfApiKey) {
      this.hf = new HfInference(hfApiKey);
    }
  }

  async initialize() {
    if (this.initialized) return;

    try {
      if (!this.hf) {
        throw new Error('HuggingFace API key not configured');
      }

      this.initialized = true;
      this.logger.log('Merchant Enrichment Service initialized');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to initialize Merchant Enrichment Service:', err);
      await this.notificationService.notifyError(err, 'Merchant Enrichment');
      throw err;
    }
  }

  async detectSubscription(merchant: string, transactions: TransactionData[]): Promise<SubscriptionInfo | null> {
    try {
      // Analyze transaction patterns
      const amounts = transactions.map(t => t.amount);
      const dates = transactions.map(t => new Date(t.date));
      
      // Sort dates chronologically
      dates.sort((a, b) => a.getTime() - b.getTime());

      // Calculate intervals between transactions
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        const days = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(days);
      }

      // Calculate statistics
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const standardDeviation = Math.sqrt(
        intervals.reduce((a, b) => a + Math.pow(b - averageInterval, 2), 0) / intervals.length,
      );

      // Check for consistent amounts
      const uniqueAmounts = new Set(amounts);
      const hasConsistentAmount = uniqueAmounts.size === 1;

      // Determine if it's a subscription
      const isSubscription = 
        intervals.length >= 2 && // Need at least 3 transactions
        standardDeviation < 5 && // Consistent intervals (within 5 days)
        hasConsistentAmount; // Same amount each time

      // Determine frequency
      let frequency: string | undefined;
      if (isSubscription) {
        if (averageInterval >= 25 && averageInterval <= 35) frequency = 'monthly';
        else if (averageInterval >= 85 && averageInterval <= 95) frequency = 'quarterly';
        else if (averageInterval >= 350 && averageInterval <= 380) frequency = 'annual';
        else frequency = `every ${Math.round(averageInterval)} days`;
      }

      return {
        isSubscription,
        frequency,
        nextPaymentDate: dates[dates.length - 1],
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error detecting subscription:', err);
      await this.notificationService.notifyError(err, 'Subscription Detection');
      return null;
    }
  }

  async analyzePurchaseHistory(
    merchant: string,
    transactions: TransactionData[]
  ): Promise<PurchaseHistory> {
    try {
      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageTransaction = totalSpent / transactions.length;
      const frequency = this.calculateFrequency(transactions);
      const category = this.determineCategory(transactions);

      return {
        amount: averageTransaction,
        date: transactions[transactions.length - 1]?.date || new Date(),
        category,
        description: transactions[transactions.length - 1]?.description || '',
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error analyzing purchase history:', err);
      throw err;
    }
  }

  private determineCategory(transactions: TransactionData[]): string {
    // Count occurrences of each category
    const categoryCounts = new Map<string, number>();
    transactions.forEach(t => {
      if (t.category && t.category.length > 0) {
        t.category.forEach(cat => {
          const count = categoryCounts.get(cat) || 0;
          categoryCounts.set(cat, count + 1);
        });
      }
    });

    // Find the most common category
    let maxCount = 0;
    let dominantCategory = '';
    categoryCounts.forEach((count, category) => {
      if (count > maxCount) {
        maxCount = count;
        dominantCategory = category;
      }
    });

    return dominantCategory || 'OTHER';
  }

  private calculateFrequency(transactions: TransactionData[]): 'one-time' | 'recurring' | 'sporadic' {
    if (transactions.length === 1) return 'one-time';

    // Sort transactions by date
    const sortedDates = transactions
      .map(t => new Date(t.date).getTime())
      .sort((a, b) => a - b);

    // Calculate intervals between transactions
    const intervals = [];
    for (let i = 1; i < sortedDates.length; i++) {
      intervals.push(sortedDates[i] - sortedDates[i-1]);
    }

    // Calculate standard deviation of intervals
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length
    );

    // If standard deviation is low relative to average interval, it's recurring
    return stdDev / avgInterval < 0.2 ? 'recurring' : 'sporadic';
  }

  async enrichMerchantData(merchant: string): Promise<EnrichedData | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const prompt = `
        Analyze this merchant: ${merchant}
        
        Provide structured information about:
        1. Industry and sub-industry
        2. Business type (B2C, B2B, etc.)
        3. Common payment methods
        4. Returns policy (if applicable)
        5. Support contact information
        
        Format the response as:
        Industry: [main industry]
        SubIndustry: [specific category]
        BusinessType: [type]
        PaymentMethods: [list]
        ReturnsPolicy: [policy]
        SupportUrl: [url]
      `;

      const response = await this.rateLimiter.withRateLimit('AI_INFERENCE', async () => {
        return this.hf.textGeneration({
          model: 'gpt2',
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
          },
        });
      });

      const enrichedData = this.parseAIResponse(response.generated_text);
      enrichedData.lastEnrichmentDate = new Date();
      enrichedData.enrichmentSource = 'AI_INFERENCE';

      return enrichedData;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error enriching merchant data:', err);
      await this.notificationService.notifyError(err, 'Merchant Enrichment');
      return null;
    }
  }

  private parseAIResponse(text: string): EnrichedData {
    const lines = text.split('\n').map(line => line.trim());
    const data: EnrichedData = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      switch (key.toLowerCase()) {
        case 'industry':
          data.industry = value;
          break;
        case 'subindustry':
          data.subIndustry = value;
          break;
        case 'businesstype':
          data.businessType = value;
          break;
        case 'paymentmethods':
          data.paymentMethods = value
            .split(',')
            .map(method => method.trim())
            .filter(method => method.length > 0);
          break;
        case 'returnspolicy':
          data.returnsPolicy = value;
          break;
        case 'supporturl':
          if (value && value !== 'N/A') {
            data.contactInfo = {
              ...data.contactInfo,
              supportUrl: value,
            };
          }
          break;
      }
    }

    return data;
  }

  async processAllMerchants(): Promise<void> {
    try {
      // Get all unique merchant names from transactions
      const merchants = await this.transactionModel.distinct('merchantName');

      for (const merchant of merchants) {
        try {
          // Get all transactions for this merchant
          const transactions = await this.transactionModel.find({ merchantName: merchant });

          // Process merchant data
          const merchantData = await this.processMerchant(
            merchant,
            transactions.map(t => ({
              id: t.id,
              accountId: t.accountId,
              amount: t.amount,
              date: t.date,
              description: t.description,
              type: t.type as 'debit' | 'credit',
              status: t.status as 'pending' | 'posted' | 'canceled',
              category: t.category,
              merchantName: t.merchantName,
              merchantCategory: t.merchantCategory,
              location: typeof t.location === 'string' ? undefined : t.location
            }))
          );

          // Update or create merchant record
          await this.merchantModel.findOneAndUpdate(
            { name: merchant },
            { $set: merchantData },
            { upsert: true }
          );

          this.logger.log(`Processed merchant: ${merchant}`);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error(`Error processing merchant ${merchant}:`, err);
          await this.notificationService.notifyError(err, 'Merchant Processing');
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error processing all merchants:', err);
      await this.notificationService.notifyError(err, 'Merchant Processing');
      throw err;
    }
  }

  async processMerchant(merchant: string, transactions: TransactionData[]): Promise<MerchantData> {
    try {
      const [subscription, purchaseHistory, enrichedData] = await Promise.all([
        this.detectSubscription(merchant, transactions),
        this.analyzePurchaseHistory(merchant, transactions),
        this.enrichMerchantData(merchant),
      ]);

      const merchantData: MerchantData = {
        name: merchant,
        category: purchaseHistory.category?.toString(),
        subscription: subscription === null ? undefined : subscription,
        purchaseHistory,
        enrichedData: enrichedData === null ? undefined : enrichedData,
      };

      return merchantData;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error processing merchant ${merchant}:`, err);
      throw err;
    }
  }

  async getPurchaseHistory(merchantId: string): Promise<PurchaseHistory> {
    try {
      const merchant = await this.merchantModel.findById(merchantId);
      if (!merchant) {
        throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
      }

      const transactions = await this.transactionModel.find({
        merchantName: merchant.name,
      });

      return this.analyzePurchaseHistory(
        merchant.name,
        transactions.map(t => ({
          id: t.id,
          accountId: t.accountId,
          amount: t.amount,
          date: t.date,
          description: t.description,
          type: t.type as 'debit' | 'credit',
          status: t.status as 'pending' | 'posted' | 'canceled',
          category: t.category,
          merchantName: t.merchantName,
          merchantCategory: t.merchantCategory,
          location: typeof t.location === 'string' ? undefined : t.location
        }))
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error getting purchase history for merchant ${merchantId}:`, err);
      throw err;
    }
  }

  private async analyzeTransactions(transactions: TransactionData[]): Promise<TransactionAnalysis> {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const analysis: TransactionAnalysis = {
      amount: totalAmount,
      date: new Date(),
      category: 'UNCATEGORIZED',
      description: undefined
    };

    return analysis;
  }

  async processTransactions(transactions: TransactionData[]): Promise<EnrichedTransaction[]> {
    try {
      const analysis = await this.analyzeTransactions(transactions);
      
      return Promise.all(transactions.map(async (transaction: TransactionData) => {
        const enriched: EnrichedTransaction = {
          id: transaction.id,
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description || 'No description',
          category: Array.isArray(transaction.category) ? transaction.category : ['UNCATEGORIZED'],
          merchantName: transaction.merchantName,
          merchantCategory: transaction.merchantCategory,
          location: transaction.location,
          enrichedData: {
            id: transaction.id,
            amount: analysis.amount,
            date: analysis.date,
            description: analysis.description || transaction.description || 'No description',
            category: analysis.category
          }
        };
        return enriched;
      }));
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error processing transactions:', err);
      throw err;
    }
  }

  private async analyzeTransactionHistory(transactions: PurchaseHistory[]): Promise<void> {
    // ... existing code ...
  }
} 