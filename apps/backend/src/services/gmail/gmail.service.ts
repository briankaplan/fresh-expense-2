import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, gmail_v1, Auth } from 'googleapis';
import { TokenManagerService } from '../../app/services/token-manager.service';
import { RateLimiter } from 'limiter';
import { retry } from 'ts-retry-promise';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GoogleService } from '../../app/services/google.service';
import { compareTwoStrings } from 'string-similarity-js';
import { CacheService } from '../cache/cache.service';

interface SearchProgress {
  account: string;
  total: number;
  processed: number;
  status: 'searching' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface SearchCriteria {
  dateRange?: {
    after: string;
    before: string;
  };
  from?: string[];
  subject?: string[];
  body?: string[];
  merchant?: string;
  amount?: number;
  category?: string;
  paymentMethod?: string;
}

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  date: Date;
  body: string;
  account: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }>;
  metadata?: {
    merchant?: string;
    amount?: number;
    date?: Date;
    category?: string;
    paymentMethod?: string;
    confidence?: number;
  };
}

interface ReceiptSearchResult {
  message: EmailMessage;
  confidence: number;
  matchFactors: {
    subject: number;
    body: number;
    amount: number;
    date: number;
    merchant: number;
    category?: number;
    paymentMethod?: number;
  };
}

@Injectable()
export class GmailService extends GoogleService implements OnModuleInit {
  protected readonly logger = new Logger(GmailService.name);
  private readonly progressMap = new Map<string, SearchProgress>();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly RECEIPT_KEYWORDS = [
    'receipt',
    'invoice',
    'order confirmation',
    'purchase',
    'transaction',
    'payment',
    'bill',
    'statement',
    'confirmation',
    'order #',
    'order number',
    'order details',
    'purchase details',
    'payment confirmation',
    'order summary',
    'order receipt',
    'purchase receipt',
    'payment receipt',
    'order confirmation',
    'purchase confirmation',
  ];
  private readonly MERCHANT_PATTERNS = {
    amount: /\$(\d+(?:\.\d{2})?)/g,
    date: /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/g,
    merchant: /(?:from|at|by|merchant|store|vendor)\s+([A-Za-z0-9\s&]+)/i,
    category: /(?:category|type|department)\s*[:=]\s*([A-Za-z0-9\s]+)/i,
    paymentMethod: /(?:paid with|payment method|card|account)\s*[:=]\s*([A-Za-z0-9\s]+)/i,
  };

  constructor(
    protected readonly configService: ConfigService,
    protected readonly tokenManager: TokenManagerService,
    protected readonly eventEmitter: EventEmitter2,
    private readonly cacheService: CacheService
  ) {
    super(configService, tokenManager, eventEmitter);
  }

  async onModuleInit() {
    await this.initialize();
  }

  protected async initialize() {
    if (this.accounts.size != null) {
      this.logger.warn('No Google accounts configured for Gmail service');
      return;
    }
    this.logger.log('Gmail service initialized');
  }

  protected async searchEmails(
    query: string,
    maxResults: number
  ): Promise<gmail_v1.Schema$Message[]> {
    const account = this.accounts.get('kaplan.brian@gmail.com');
    if (!account || !account.oauth2Client) {
      throw new Error('No account configuration found');
    }

    const gmail = google.gmail({ version: 'v1', auth: account.oauth2Client });

    return this.rateLimiter.withRateLimit('GMAIL.SEARCH', async () => {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });
      return response.data.messages || [];
    });
  }

  protected parseMessageDetails(
    message: gmail_v1.Schema$Message,
    accountEmail: string
  ): EmailMessage | null {
    if (!message.payload) return null;

    const headers = message.payload.headers || [];
    const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '';
    const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
    const date = new Date(headers.find(h => h.name?.toLowerCase() === 'date')?.value || '');

    let body = '';
    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType != null && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    } else if (message.payload.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }

    return {
      id: message.id || '',
      subject,
      from,
      date,
      body,
      account: accountEmail,
    };
  }

  async searchReceipts(criteria: SearchCriteria): Promise<ReceiptSearchResult[]> {
    try {
      const query = this.buildSearchQuery(criteria);
      const messages = await this.searchEmails(query, 100);

      const results: ReceiptSearchResult[] = [];
      for (const message of messages) {
        const emailMessage = this.parseMessageDetails(message, criteria.from?.[0] || '');
        if (!emailMessage) continue;

        const matchFactors = await this.calculateMatchFactors(emailMessage, criteria);
        const confidence = this.calculateConfidence(matchFactors);

        if (confidence > 0.5) {
          // Minimum confidence threshold
          results.push({
            message: emailMessage,
            confidence,
            matchFactors,
          });
        }
      }

      return results.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      this.logger.error('Error searching receipts:', error);
      throw error;
    }
  }

  private async calculateMatchFactors(
    message: EmailMessage,
    criteria: SearchCriteria
  ): Promise<ReceiptSearchResult['matchFactors']> {
    const [subjectScore, bodyScore, merchantScore] = await Promise.all([
      this.calculateSubjectScore(message.subject),
      this.calculateBodyScore(message.body),
      this.calculateMerchantScore(message, criteria.merchant),
    ]);

    const factors: ReceiptSearchResult['matchFactors'] = {
      subject: subjectScore,
      body: bodyScore,
      amount: this.calculateAmountScore(message, criteria.amount),
      date: this.calculateDateScore(message, criteria.dateRange),
      merchant: merchantScore,
    };

    if (criteria.category) {
      factors.category = this.calculateCategoryScore(message, criteria.category);
    }

    if (criteria.paymentMethod) {
      factors.paymentMethod = this.calculatePaymentMethodScore(message, criteria.paymentMethod);
    }

    return factors;
  }

  private calculateConfidence(factors: ReceiptSearchResult['matchFactors']): number {
    const weights = {
      subject: 0.2,
      body: 0.3,
      amount: { value: 0.2, currency: "USD" },
      date: 0.15,
      merchant: 0.15,
      category: 0.1,
      paymentMethod: 0.1,
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(weights)) {
      const factorValue = factors[factor as keyof typeof factors];
      if (typeof factorValue === 'number') {
        totalScore += factorValue * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private async calculateSubjectScore(subject: string): Promise<number> {
    const cacheKey = `subject:${subject}`;
    const cachedScore = await this.cacheService.get<number>(cacheKey);
    if (cachedScore !== undefined) {
      return cachedScore;
    }

    let score = 0;
    for (const keyword of this.RECEIPT_KEYWORDS) {
      const similarity = compareTwoStrings(subject.toLowerCase(), keyword.toLowerCase());
      score = Math.max(score, similarity);
    }

    await this.cacheService.set(cacheKey, score, this.CACHE_TTL);
    return score;
  }

  private async calculateBodyScore(body: string): Promise<number> {
    const cacheKey = `body:${body.substring(0, 100)}`;
    const cachedScore = await this.cacheService.get<number>(cacheKey);
    if (cachedScore !== undefined) {
      return cachedScore;
    }

    let score = 0;
    for (const keyword of this.RECEIPT_KEYWORDS) {
      if (body.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.1;
      }
    }

    // Check for amount pattern
    const amountMatch = body.match(this.MERCHANT_PATTERNS.amount);
    if (amountMatch) {
      score += 0.2;
    }

    // Check for date pattern
    const dateMatch = body.match(this.MERCHANT_PATTERNS.date);
    if (dateMatch) {
      score += 0.2;
    }

    score = Math.min(1, score);
    await this.cacheService.set(cacheKey, score, this.CACHE_TTL);
    return score;
  }

  private calculateAmountScore(message: EmailMessage, targetAmount?: number): number {
    if (!targetAmount) return 0.5;

    const amountMatch = message.body.match(this.MERCHANT_PATTERNS.amount);
    if (!amountMatch) return 0;

    const extractedAmount = parseFloat(amountMatch[1]);
    if (isNaN(extractedAmount)) return 0;

    const difference = Math.abs(extractedAmount - targetAmount);
    return Math.max(0, 1 - difference / targetAmount);
  }

  private calculateDateScore(
    message: EmailMessage,
    dateRange?: SearchCriteria['dateRange']
  ): number {
    if (!dateRange) return 0.5;

    const messageDate = message.date;
    const afterDate = new Date(dateRange.after);
    const beforeDate = new Date(dateRange.before);

    if (messageDate >= afterDate && messageDate <= beforeDate) {
      return 1;
    }

    return 0;
  }

  private async calculateMerchantScore(
    message: EmailMessage,
    targetMerchant?: string
  ): Promise<number> {
    if (!targetMerchant) return 0.5;

    const cacheKey = `merchant:${message.id}:${targetMerchant}`;
    const cachedScore = await this.cacheService.get<number>(cacheKey);
    if (cachedScore !== undefined) {
      return cachedScore;
    }

    const merchantMatch = message.body.match(this.MERCHANT_PATTERNS.merchant);
    if (!merchantMatch) return 0;

    const extractedMerchant = merchantMatch[1].trim();
    const score = compareTwoStrings(extractedMerchant.toLowerCase(), targetMerchant.toLowerCase());

    await this.cacheService.set(cacheKey, score, this.CACHE_TTL);
    return score;
  }

  private calculateCategoryScore(message: EmailMessage, targetCategory: string): number {
    const categoryMatch = message.body.match(this.MERCHANT_PATTERNS.category);
    if (!categoryMatch) return 0;

    const extractedCategory = categoryMatch[1].trim();
    return compareTwoStrings(extractedCategory.toLowerCase(), targetCategory.toLowerCase());
  }

  private calculatePaymentMethodScore(message: EmailMessage, targetPaymentMethod: string): number {
    const paymentMethodMatch = message.body.match(this.MERCHANT_PATTERNS.paymentMethod);
    if (!paymentMethodMatch) return 0;

    const extractedPaymentMethod = paymentMethodMatch[1].trim();
    return compareTwoStrings(
      extractedPaymentMethod.toLowerCase(),
      targetPaymentMethod.toLowerCase()
    );
  }

  private buildSearchQuery(criteria: SearchCriteria): string {
    const queryParts: string[] = [];

    // Date range
    if (criteria.dateRange) {
      if (criteria.dateRange.after) {
        queryParts.push(`after:${criteria.dateRange.after}`);
      }
      if (criteria.dateRange.before) {
        queryParts.push(`before:${criteria.dateRange.before}`);
      }
    }

    // From addresses
    if (criteria.from?.length) {
      queryParts.push(`from:(${criteria.from.join(' OR ')})`);
    }

    // Subject keywords
    if (criteria.subject?.length) {
      queryParts.push(`subject:(${criteria.subject.join(' OR ')})`);
    }

    // Body keywords
    if (criteria.body?.length) {
      queryParts.push(`(${criteria.body.join(' OR ')})`);
    }

    // Add receipt keywords
    queryParts.push(`(${this.RECEIPT_KEYWORDS.join(' OR ')})`);

    return queryParts.join(' ');
  }
}
