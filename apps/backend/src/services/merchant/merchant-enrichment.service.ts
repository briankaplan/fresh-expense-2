import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HfInference } from '@huggingface/inference';
import { Transaction } from '../../schemas/transaction.schema';
import { Merchant, MerchantDocument } from '../../schemas/merchant.schema';
import { TRANSACTION_CATEGORIES, TransactionCategory } from '../../types/transaction.types';

interface SubscriptionInfo {
  isSubscription: boolean;
  frequency?: string;
  typicalAmount?: number;
  lastRenewalDate?: Date;
  nextRenewalDate?: Date;
}

interface PurchaseHistory {
  totalTransactions: number;
  firstPurchaseDate: Date;
  lastPurchaseDate: Date;
  averageAmount: number;
  frequency: 'one-time' | 'recurring' | 'sporadic';
  commonCategories: TransactionCategory[];
  monthlyTotals: Array<{
    month: Date;
    total: number;
    count: number;
  }>;
}

type CategoryCount = Partial<Record<TransactionCategory, number>>;

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
export class MerchantEnrichmentService {
  private readonly logger = new Logger(MerchantEnrichmentService.name);
  private hf: HfInference;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>
  ) {
    const hfToken = this.configService.get<string>('HUGGINGFACE_API_TOKEN');
    if (!hfToken) {
      this.logger.warn('No HuggingFace API token found, AI enrichment will be limited');
    } else {
      this.hf = new HfInference(hfToken);
      this.logger.log('HuggingFace API client initialized');
    }
  }

  /**
   * Detect subscription patterns in transactions
   */
  async detectSubscription(merchant: string, transactions: Transaction[]): Promise<SubscriptionInfo | null> {
    try {
      if (!transactions || transactions.length < 3) {
        return null;
      }

      // Sort transactions by date
      const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Calculate intervals between transactions
      const intervals = [];
      for (let i = 1; i < sortedTransactions.length; i++) {
        const days = (sortedTransactions[i].date.getTime() - sortedTransactions[i-1].date.getTime()) / (1000 * 60 * 60 * 24);
        intervals.push(days);
      }

      // Analyze patterns
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const standardDeviation = Math.sqrt(
        intervals.reduce((a, b) => a + Math.pow(b - averageInterval, 2), 0) / intervals.length
      );

      // Check for consistent amounts
      const amounts = sortedTransactions.map(t => t.amount);
      const uniqueAmounts = new Set(amounts);
      const hasConsistentAmount = uniqueAmounts.size === 1;

      // Determine if it's a subscription
      const isSubscription = 
        intervals.length >= 2 && // Need at least 3 transactions
        standardDeviation < 5 && // Consistent intervals (within 5 days)
        hasConsistentAmount; // Same amount each time

      if (!isSubscription) {
        return { isSubscription: false };
      }

      // Determine frequency
      let frequency: string;
      if (averageInterval >= 25 && averageInterval <= 35) frequency = 'monthly';
      else if (averageInterval >= 85 && averageInterval <= 95) frequency = 'quarterly';
      else if (averageInterval >= 350 && averageInterval <= 380) frequency = 'annual';
      else frequency = `every ${Math.round(averageInterval)} days`;

      const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
      
      return {
        isSubscription: true,
        frequency,
        typicalAmount: hasConsistentAmount ? amounts[0] : undefined,
        lastRenewalDate: lastTransaction.date,
        nextRenewalDate: new Date(lastTransaction.date.getTime() + (averageInterval * 24 * 60 * 60 * 1000))
      };
    } catch (error) {
      this.logger.error('Error detecting subscription:', error);
      return null;
    }
  }

  /**
   * Analyze purchase history for a merchant
   */
  async analyzePurchaseHistory(merchant: string): Promise<PurchaseHistory | null> {
    try {
      if (!this.hf) {
        this.logger.warn('HuggingFace client not initialized');
        return null;
      }

      const transactions = await this.transactionModel
        .find({ merchant })
        .sort({ date: 1 })
        .exec();

      if (!transactions || transactions.length === 0) {
        return null;
      }

      const totalTransactions = transactions.length;
      const firstPurchaseDate = transactions[0].date;
      const lastPurchaseDate = transactions[transactions.length - 1].date;
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = totalAmount / totalTransactions;

      const monthlyTotals = transactions.reduce((acc, t) => {
        const month = new Date(t.date);
        month.setDate(1);
        month.setHours(0, 0, 0, 0);
        
        const key = month.toISOString();
        if (!acc[key]) {
          acc[key] = { month, total: 0, count: 0 };
        }
        acc[key].total += t.amount;
        acc[key].count += 1;
        return acc;
      }, {} as Record<string, { month: Date; total: number; count: number; }>);

      const daysBetween = (lastPurchaseDate.getTime() - firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24);
      const purchasesPerMonth = (totalTransactions / daysBetween) * 30;
      
      let frequency: 'one-time' | 'recurring' | 'sporadic';
      if (totalTransactions === 1) frequency = 'one-time';
      else if (purchasesPerMonth >= 0.95 && purchasesPerMonth <= 1.05) frequency = 'recurring';
      else frequency = 'sporadic';

      const categoryCount = transactions.reduce((acc, t) => {
        if (t.category && Array.isArray(t.category)) {
          t.category.forEach(cat => {
            if (typeof cat === 'string') {
              const normalizedCategory = normalizeCategory(cat);
              acc[normalizedCategory] = (acc[normalizedCategory] || 0) + 1;
            }
          });
        }
        return acc;
      }, {} as CategoryCount);

      const commonCategories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => (Number(b) || 0) - (Number(a) || 0))
        .slice(0, 3)
        .map(([category]) => category as TransactionCategory)
        .filter(isTransactionCategory);

      return {
        totalTransactions,
        firstPurchaseDate,
        lastPurchaseDate,
        averageAmount,
        frequency,
        commonCategories,
        monthlyTotals: Object.values(monthlyTotals)
      };
    } catch (error) {
      this.logger.error('Error analyzing purchase history:', error);
      return null;
    }
  }

  /**
   * Enrich merchant data using AI
   */
  async enrichMerchantData(merchant: MerchantDocument): Promise<Partial<Merchant> | null> {
    try {
      if (!this.hf) {
        return null;
      }

      const displayCategory = isValidCategory(merchant.category)
        ? getCategoryDisplayName(merchant.category)
        : TRANSACTION_CATEGORIES.OTHER;

      const tags = Array.isArray(merchant.tags) ? merchant.tags.join(', ') : 'None';

      const prompt = `Analyze this merchant:
Name: ${merchant.name}
Category: ${displayCategory}
Tags: ${tags}

Please provide:
1. Most likely industry from these options: ${Object.values(TRANSACTION_CATEGORIES).join(', ')}
2. Business type (B2B, B2C, or both)
3. Common payment methods
4. Typical returns policy
5. Likely contact channels`;

      const response = await this.hf.textGeneration({
        model: 'gpt2' as const,  // Explicitly type as const to satisfy strict type checking
        inputs: prompt,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
          return_full_text: false
        }
      });

      if (!response.generated_text) {
        throw new Error('No response from AI model');
      }

      // Parse and structure the enriched data
      const enrichedData = this.parseAIResponse(response.generated_text);
      
      return {
        ...enrichedData,
        lastEnrichmentDate: new Date(),
        enrichmentSource: 'huggingface_ai'
      };
    } catch (error) {
      this.logger.error('Error enriching merchant data:', error);
      return null;
    }
  }

  /**
   * Parse AI response into structured data
   */
  private parseAIResponse(text: string): Partial<Merchant> {
    const lines = text.split('\n');
    const data: Partial<Merchant> = {};

    for (const line of lines) {
      if (line.includes('industry:')) {
        const industry = line.split(':')[1]?.trim();
        if (industry) {
          data.category = getTransactionCategoryFromDisplay(industry);
        }
      }
      if (line.includes('business type:')) {
        data.businessType = line.split(':')[1]?.trim() || undefined;
      }
      if (line.includes('payment methods:')) {
        data.acceptedPaymentMethods = line.split(':')[1]?.split(',').map(m => m.trim()) || [];
      }
      if (line.includes('returns policy:')) {
        data.returnsPolicy = line.split(':')[1]?.trim() || undefined;
      }
      if (line.includes('contact channels:')) {
        data.contactChannels = line.split(':')[1]?.split(',').map(c => c.trim()) || [];
      }
    }

    return data;
  }

  /**
   * Process all merchants for enrichment
   */
  async processAllMerchants(): Promise<void> {
    try {
      const merchants = await this.merchantModel.find().exec();
      
      for (const merchant of merchants) {
        // Skip if recently enriched (within last 7 days)
        if (merchant.lastEnrichmentDate && 
            (new Date().getTime() - merchant.lastEnrichmentDate.getTime()) < 7 * 24 * 60 * 60 * 1000) {
          continue;
        }

        // Get all transactions for this merchant
        const transactions = await this.transactionModel
          .find({ merchant: merchant.name })
          .sort({ date: 1 })
          .exec();

        // Skip if no transactions
        if (!transactions.length) continue;

        // Detect subscription patterns
        const subscription = await this.detectSubscription(merchant.name, transactions);
        
        // Analyze purchase history
        const purchaseHistory = await this.analyzePurchaseHistory(merchant.name);
        
        // Get enriched merchant data
        const enrichedData = await this.enrichMerchantData(merchant);

        // Update merchant record
        if (subscription || purchaseHistory || enrichedData) {
          await this.merchantModel.updateOne(
            { _id: merchant._id },
            {
              $set: {
                ...(subscription && { subscription }),
                ...(purchaseHistory && { purchaseHistory }),
                ...(enrichedData && enrichedData),
                updatedAt: new Date()
              }
            }
          );

          this.logger.log(`Updated merchant: ${merchant.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Error processing merchants:', error);
      throw error;
    }
  }
} 