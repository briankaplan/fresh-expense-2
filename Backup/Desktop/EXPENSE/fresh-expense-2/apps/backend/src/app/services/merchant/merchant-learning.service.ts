import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from '../../schemas/merchant.schema';

interface ReceiptLearningData {
  merchantName: string;
  amount?: number;
  date?: Date;
  items?: Array<{
    description: string;
    amount: number;
    category?: string;
  }>;
  category?: string;
  isSubscription?: boolean;
  confidence: number;
}

interface MerchantFeedback {
  originalMerchant: string;
  correctMerchant: string;
  isCorrect: boolean;
  receiptText?: string;
  amount?: number;
  date?: Date;
  items?: Array<{
    description: string;
    amount: number;
    category?: string;
  }>;
}

@Injectable()
export class MerchantLearningService {
  private readonly logger = new Logger(MerchantLearningService.name);

  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>
  ) {}

  /**
   * Learn from a processed receipt
   */
  async learnFromReceipt(data: ReceiptLearningData): Promise<void> {
    const merchant = await this.getOrCreateMerchant(data.merchantName);
    
    // Update learning data
    await this.merchantModel.updateOne(
      { _id: merchant._id },
      {
        $set: {
          'learningData.lastUpdated': new Date(),
          'metadata.lastTransaction': new Date()
        },
        $inc: {
          'metadata.totalTransactions': 1,
          'learningData.averageTransaction.count': 1
        }
      }
    );

    // Update average transaction amount
    if (data.amount) {
      const currentAvg = merchant.learningData.averageTransaction.amount;
      const currentCount = merchant.learningData.averageTransaction.count;
      const newAvg = ((currentAvg * currentCount) + data.amount) / (currentCount + 1);
      await this.merchantModel.updateOne(
        { _id: merchant._id },
        {
          $set: {
            'learningData.averageTransaction.amount': newAvg
          }
        }
      );
    }

    // Learn from items
    if (data.items?.length) {
      for (const item of data.items) {
        if (item.category) {
          await this.updateItemPattern(merchant._id, item.description, item.category);
        }
      }
    }

    // Update category confidence
    if (data.category) {
      await this.updateCategoryConfidence(merchant._id, data.category, data.confidence);
    }

    // Update subscription status
    if (data.isSubscription !== undefined) {
      await this.updateSubscriptionStatus(merchant._id, data.amount);
    }
  }

  /**
   * Process feedback about merchant recognition
   */
  async processFeedback(feedback: MerchantFeedback): Promise<void> {
    // If the recognition was incorrect, we need to:
    // 1. Decrease confidence for the incorrect merchant
    // 2. Add the receipt pattern to the correct merchant
    // 3. Possibly add an alias if the names are similar

    if (!feedback.isCorrect) {
      const [originalMerchant, correctMerchant] = await Promise.all([
        this.merchantModel.findOne({ name: feedback.originalMerchant }),
        this.getOrCreateMerchant(feedback.correctMerchant)
      ]);

      if (originalMerchant) {
        // Decrease confidence
        await this.merchantModel.updateOne(
          { _id: originalMerchant._id },
          {
            $inc: { 'metadata.confidence': -0.1 },
            $set: { 'metadata.recognitionRate': 
              (originalMerchant.metadata.recognitionRate * 
               originalMerchant.metadata.totalTransactions - 1) /
              originalMerchant.metadata.totalTransactions
            }
          }
        );
      }

      // Learn the correct pattern
      if (feedback.receiptText) {
        await this.learnReceiptPattern(correctMerchant._id, feedback.receiptText);
      }

      // Check if we should add an alias
      if (this.shouldAddAlias(feedback.originalMerchant, feedback.correctMerchant)) {
        await this.merchantModel.updateOne(
          { _id: correctMerchant._id },
          { $addToSet: { aliases: feedback.originalMerchant } }
        );
      }
    }
  }

  /**
   * Analyze receipt text and suggest merchant
   */
  async analyzeReceipt(text: string): Promise<{
    merchantName: string;
    confidence: number;
    category?: string;
    isSubscription?: boolean;
    amount?: number;
    date?: Date;
    items?: Array<{
      description: string;
      amount: number;
      category?: string;
    }>;
  }> {
    // Get all merchants
    const merchants = await this.merchantModel.find().select('name aliases learningData metadata');
    
    let bestMatch = {
      merchant: null as MerchantDocument | null,
      confidence: 0
    };

    // Check each merchant's patterns
    for (const merchant of merchants) {
      const confidence = await this.calculateMerchantConfidence(merchant, text);
      if (confidence > bestMatch.confidence) {
        bestMatch = { merchant, confidence };
      }
    }

    if (!bestMatch.merchant) {
      return {
        merchantName: this.extractPotentialMerchantName(text),
        confidence: 0.1
      };
    }

    // Extract additional data
    const amount = this.extractAmount(text);
    const date = this.extractDate(text);
    const items = this.extractItems(text);

    return {
      merchantName: bestMatch.merchant.name,
      confidence: bestMatch.confidence,
      category: bestMatch.merchant.category,
      isSubscription: bestMatch.merchant.subscription?.typical,
      amount,
      date,
      items
    };
  }

  /**
   * Get merchant suggestions for text
   */
  async suggestMerchants(text: string): Promise<Array<{ merchant: string; confidence: number }>> {
    const merchants = await this.merchantModel.find().select('name aliases learningData metadata');
    const suggestions: Array<{ merchant: string; confidence: number }> = [];

    for (const merchant of merchants) {
      const confidence = await this.calculateMerchantConfidence(merchant, text);
      if (confidence > 0.3) {
        suggestions.push({ merchant: merchant.name, confidence });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  /**
   * Get or create a merchant
   */
  private async getOrCreateMerchant(name: string): Promise<MerchantDocument> {
    let merchant = await this.merchantModel.findOne({ name });
    
    if (!merchant) {
      merchant = new this.merchantModel({
        name,
        aliases: [],
        learningData: {
          itemPatterns: [],
          pricePatterns: [],
          receiptPatterns: {
            headerPatterns: [],
            footerPatterns: [],
            confidence: 0,
            matches: 0
          },
          commonCategories: [],
          averageTransaction: {
            amount: 0,
            count: 0
          },
          lastUpdated: new Date()
        },
        metadata: {
          confidence: 0.5,
          totalTransactions: 0,
          averageConfidence: 0.5,
          recognitionRate: 1
        }
      });
      await merchant.save();
    }

    return merchant;
  }

  /**
   * Update item pattern learning
   */
  private async updateItemPattern(
    merchantId: string,
    description: string,
    category: string
  ): Promise<void> {
    const pattern = this.createItemPattern(description);
    
    await this.merchantModel.updateOne(
      { 
        _id: merchantId,
        'learningData.itemPatterns.pattern': pattern
      },
      {
        $inc: {
          'learningData.itemPatterns.$.matches': 1,
          'learningData.itemPatterns.$.confidence': 0.1
        }
      }
    );
  }

  /**
   * Update category confidence
   */
  private async updateCategoryConfidence(
    merchantId: string,
    category: string,
    confidence: number
  ): Promise<void> {
    await this.merchantModel.updateOne(
      {
        _id: merchantId,
        'learningData.commonCategories.category': category
      },
      {
        $inc: {
          'learningData.commonCategories.$.count': 1,
          'learningData.commonCategories.$.confidence': confidence
        }
      }
    );
  }

  /**
   * Update subscription status
   */
  private async updateSubscriptionStatus(
    merchantId: string,
    amount?: number
  ): Promise<void> {
    const merchant = await this.merchantModel.findById(merchantId);
    if (!merchant || !amount) return;

    const lastAmount = merchant.subscription?.averageAmount;
    const lastDate = merchant.subscription?.lastDetected;
    
    if (lastAmount && lastDate) {
      const daysDiff = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      const amountDiff = Math.abs(amount - lastAmount) / lastAmount;

      if (daysDiff > 25 && daysDiff < 35 && amountDiff < 0.1) {
        // Likely monthly subscription
        await this.merchantModel.updateOne(
          { _id: merchantId },
          {
            $set: {
              'subscription.typical': true,
              'subscription.frequency': 'MONTHLY',
              'subscription.averageAmount': (lastAmount + amount) / 2,
              'subscription.lastDetected': new Date()
            }
          }
        );
      }
    } else {
      await this.merchantModel.updateOne(
        { _id: merchantId },
        {
          $set: {
            'subscription.averageAmount': amount,
            'subscription.lastDetected': new Date()
          }
        }
      );
    }
  }

  /**
   * Calculate merchant confidence for text
   */
  private async calculateMerchantConfidence(merchant: MerchantDocument, text: string): Promise<number> {
    let confidence = 0;
    const normalizedText = text.toLowerCase();

    // Check name match
    if (normalizedText.includes(merchant.name.toLowerCase())) {
      confidence += 0.5;
    }

    // Check aliases
    for (const alias of merchant.aliases) {
      if (normalizedText.includes(alias.toLowerCase())) {
        confidence += 0.3;
        break;
      }
    }

    // Check receipt patterns
    if (merchant.learningData.receiptPatterns) {
      const { headerPatterns, footerPatterns } = merchant.learningData.receiptPatterns;
      
      for (const pattern of headerPatterns) {
        if (normalizedText.includes(pattern.toLowerCase())) {
          confidence += 0.2;
        }
      }

      for (const pattern of footerPatterns) {
        if (normalizedText.includes(pattern.toLowerCase())) {
          confidence += 0.1;
        }
      }
    }

    return Math.min(confidence, 1);
  }

  /**
   * Create pattern from item description
   */
  private createItemPattern(description: string): string {
    // Convert description to a pattern
    // This could be enhanced with regex or more sophisticated pattern matching
    return description.toLowerCase()
      .replace(/[0-9]/g, '#')
      .replace(/[^a-z#\s]/g, '?');
  }

  /**
   * Check if we should add an alias
   */
  private shouldAddAlias(original: string, correct: string): boolean {
    // Simple Levenshtein distance check
    const distance = this.levenshteinDistance(
      original.toLowerCase(),
      correct.toLowerCase()
    );
    return distance <= 3; // Allow up to 3 character differences
  }

  /**
   * Extract potential merchant name from text
   */
  private extractPotentialMerchantName(text: string): string {
    // This is a placeholder implementation
    // Could be enhanced with NLP or more sophisticated name extraction
    const lines = text.split('\n');
    return lines[0] || 'Unknown Merchant';
  }

  /**
   * Calculate Levenshtein distance between strings
   */
  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Learn receipt patterns from text
   */
  private async learnReceiptPattern(merchantId: string, text: string): Promise<void> {
    const lines = text.split('\n');
    const headerLines = lines.slice(0, 3); // First 3 lines
    const footerLines = lines.slice(-3); // Last 3 lines

    // Update header patterns
    for (const line of headerLines) {
      if (line.trim()) {
        await this.merchantModel.updateOne(
          { _id: merchantId },
          {
            $addToSet: {
              'learningData.receiptPatterns.headerPatterns': line.trim()
            },
            $inc: {
              'learningData.receiptPatterns.matches': 1
            }
          }
        );
      }
    }

    // Update footer patterns
    for (const line of footerLines) {
      if (line.trim()) {
        await this.merchantModel.updateOne(
          { _id: merchantId },
          {
            $addToSet: {
              'learningData.receiptPatterns.footerPatterns': line.trim()
            }
          }
        );
      }
    }

    // Update confidence
    await this.merchantModel.updateOne(
      { _id: merchantId },
      {
        $inc: {
          'learningData.receiptPatterns.confidence': 0.1
        }
      }
    );
  }

  /**
   * Extract amount from text
   */
  private extractAmount(text: string): number | undefined {
    // Common patterns for total amounts
    const patterns = [
      /total:?\s*[\$£€]?\s*([\d,.]+)/i,
      /amount:?\s*[\$£€]?\s*([\d,.]+)/i,
      /[\$£€]\s*([\d,.]+)\s*$/,
      /([\d,.]+)\s*[\$£€]\s*$/
    ];

    const lines = text.split('\n');
    
    // Search from bottom up as total is usually at the bottom
    for (const line of lines.reverse()) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }

    return undefined;
  }

  /**
   * Extract date from text
   */
  private extractDate(text: string): Date | undefined {
    const lines = text.split('\n');
    
    // Common date patterns
    const patterns = [
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2}),? (\d{4})/i,
      /(\d{4})-(\d{2})-(\d{2})/
    ];

    for (const line of lines) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          try {
            const date = new Date(line);
            if (!isNaN(date.getTime())) {
              return date;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Extract items from text
   */
  private extractItems(text: string): Array<{ description: string; amount: number; category?: string }> {
    const lines = text.split('\n');
    const items: Array<{ description: string; amount: number; category?: string }> = [];
    
    let inItemsSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      if (/items|products|description/i.test(trimmedLine)) {
        inItemsSection = true;
        continue;
      }
      
      if (/subtotal|total|tax|payment/i.test(trimmedLine)) {
        inItemsSection = false;
        continue;
      }
      
      if (inItemsSection) {
        const itemMatch = trimmedLine.match(/^(.+?)\s+[\$£€]?\s*([\d,.]+)\s*$/);
        if (itemMatch) {
          const [_, description, amountStr] = itemMatch;
          const amount = parseFloat(amountStr.replace(/,/g, ''));
          
          if (!isNaN(amount) && description) {
            items.push({
              description: description.trim(),
              amount,
              category: undefined
            });
          }
        }
      }
    }

    return items;
  }
} 