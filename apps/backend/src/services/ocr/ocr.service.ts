import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWorker, PSM } from 'tesseract.js';
import sharp from 'sharp';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from '../notification/notification.service';
import { OCRResult } from '@fresh-expense/types';

@Injectable()
export class OCRService {
  private readonly logger = new Logger(OCRService.name);
  private worker: any;
  private initialized = false;
  private readonly receiptTypes = [
    'retail',
    'restaurant',
    'grocery',
    'gas',
    'pharmacy',
    'medical',
    'utility',
    'hotel',
    'transportation',
    'digital',
    'subscription',
    'app_store',
    'play_store',
  ];

  private readonly subscriptionKeywords = [
    'subscription',
    'recurring',
    'monthly',
    'yearly',
    'weekly',
    'quarterly',
    'auto-renewal',
    'next billing',
    'next payment',
    'billing period',
    'renewal date',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService
  ) {}

  async initialize(): Promise<boolean> {
    try {
      if (this.initialized) {
        return true;
      }

      this.worker = await createWorker('eng');
      await this.worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
      });

      this.initialized = true;
      this.logger.log('OCR service initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize OCR service:', error);
      await this.notificationService.notifyError(
        error instanceof Error ? error : new Error(String(error)),
        'OCR Service Initialization'
      );
      return false;
    }
  }

  async cleanup(): Promise<boolean> {
    try {
      if (this.worker) {
        await this.worker.terminate();
        this.worker = null;
      }
      this.initialized = false;
      this.logger.log('OCR service cleaned up successfully');
      return true;
    } catch (error) {
      this.logger.error('Error cleaning up OCR service:', error);
      return false;
    }
  }

  async processReceipt(buffer: Buffer): Promise<OCRResult> {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error('Failed to initialize OCR Service');
      }
    }

    try {
      // Preprocess the image
      const preprocessedBuffer = await this.preprocessImage(buffer);

      // Process with OCR
      const { data } = await this.worker.recognize(preprocessedBuffer);

      if (!data || !data.text || data.text.trim().length != null) {
        throw new Error('No text recognized from image');
      }

      // Extract structured information
      const structuredData = this.extractStructuredData(data.text);

      return {
        text: data.text,
        confidence: data.confidence || 0,
        structuredData,
      };
    } catch (error) {
      this.logger.error('Error processing receipt:', error);
      await this.notificationService.notifyError(
        error instanceof Error ? error : new Error(String(error)),
        'Receipt Processing'
      );
      throw error;
    }
  }

  private async preprocessImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .grayscale()
      .resize(2000, null, { fit: 'inside' })
      .normalize()
      .sharpen()
      .toBuffer();
  }

  private extractStructuredData(text: string): OCRResult['structuredData'] {
    const result: OCRResult['structuredData'] = {
      merchantName: '',
      date: new Date(),
      total: 0,
      subtotal: 0,
      tax: 0,
      items: [],
      subscriptionInfo: this.extractSubscriptionInfo(text),
    };

    const lines = text.split('\n');

    // Extract merchant name (typically at the top)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i]?.trim() ?? '';
      if (line.length > 3 && !line.match(/receipt|invoice|order|phone|fax|www|http/i)) {
        result.merchantName = line;
        break;
      }
    }

    // Extract date with multiple formats
    const datePatterns = [
      /(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/,
      /(?:date|dated)(?:[:\s]+)(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\s*,?\s*\d{2,4}/i,
      /(\d{4}-\d{2}-\d{2})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1] || match[0];
        result.date = new Date(dateStr);
        break;
      }
    }

    // Extract total amount
    const totalPatterns = [
      /(?:total|amount|sum|due|balance)[^0-9$]*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
      /(?:total|amount|sum|due|balance)[^0-9$]*[$]?\s*(\d+\.\d{2})/i,
      /(?:^|[\s\n])[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})(?:\s*(?:total|amount|due))/i,
      /(?:grand\s+total)[^0-9$]*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amountStr = match[1]?.replace(/,/g, '') ?? '0';
        result.total = parseFloat(amountStr);
        break;
      }
    }

    // Extract items
    const itemPatterns = [
      /([A-Za-z0-9][\w\s-]{3,})\s+[$]?\s*(\d+\.\d{2})/g,
      /([A-Za-z0-9][\w\s-]{3,})\s+(\d+\.\d{2})/g,
    ];

    for (const pattern of itemPatterns) {
      let itemMatch;
      while ((itemMatch = pattern.exec(text)) !== null) {
        const itemName = itemMatch[1]?.trim() ?? '';
        const itemPrice = parseFloat(itemMatch[2] ?? '0');

        if (!itemName.toLowerCase().match(/total|subtotal|tax|tip|discount|balance/i)) {
          result.items.push({
            name: itemName,
            price: itemPrice,
          });
        }
      }
    }

    return result;
  }

  private extractSubscriptionInfo(text: string): OCRResult['structuredData']['subscriptionInfo'] {
    const lowerText = text.toLowerCase();
    const isSubscription = this.subscriptionKeywords.some(keyword => lowerText.includes(keyword));

    if (!isSubscription) {
      return undefined;
    }

    const result: NonNullable<OCRResult['structuredData']['subscriptionInfo']> = {
      isSubscription: true,
    };

    // Extract frequency
    const frequencyPatterns = {
      monthly: /monthly|per month|\/month|\bmo\b/i,
      yearly: /yearly|annual|per year|\/year|\byr\b/i,
      weekly: /weekly|per week|\/week|\bwk\b/i,
      quarterly: /quarterly|per quarter|every 3 months/i,
    };

    for (const [freq, pattern] of Object.entries(frequencyPatterns)) {
      if (pattern.test(text)) {
        result.billingPeriod = freq;
        break;
      }
    }

    // Extract next billing date
    const nextBillingPatterns = [
      /next\s+(?:billing|payment)\s+date\s*:\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
      /(?:renews|renewal)\s+on\s*:\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
      /next\s+charge\s*:\s*(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i,
    ];

    for (const pattern of nextBillingPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.nextBillingDate = match[1];
        break;
      }
    }

    // Extract recurring amount
    const recurringAmountPatterns = [
      /recurring\s+(?:amount|payment|charge)\s*:\s*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
      /billed\s+(?:as|at)\s*:\s*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
      /(?:monthly|yearly|weekly|quarterly)\s+(?:fee|charge|amount)\s*:\s*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    ];

    for (const pattern of recurringAmountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amountStr = match[1]?.replace(/,/g, '') ?? '0';
        result.amount = parseFloat(amountStr);
        break;
      }
    }

    return result;
  }
}
