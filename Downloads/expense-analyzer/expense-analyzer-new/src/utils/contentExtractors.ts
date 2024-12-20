'use client';

import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';
import { Logger } from '@/utils/logger';
import { normalizeMerchantName } from '@/utils/merchantMatching';

interface ExtractedReceipt {
  merchant?: string;
  date?: string;
  total?: number;
  items?: Array<{ description: string; amount: number }>;
  confidence: number;
}

interface ExtractionResult {
  receipt?: ExtractedReceipt;
  error?: string;
  metadata?: Record<string, any>;
}

// Common patterns for receipt data
const PATTERNS = {
  total: [
    /total:?\s*[\$£€]?\s*([\d,.]+)/i,
    /amount:?\s*[\$£€]?\s*([\d,.]+)/i,
    /paid:?\s*[\$£€]?\s*([\d,.]+)/i,
    /sum:?\s*[\$£€]?\s*([\d,.]+)/i
  ],
  date: [
    /date:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/
  ],
  merchant: [
    /merchant:?\s*([^,\n\r]+)/i,
    /from:?\s*([^,\n\r]+)/i,
    /store:?\s*([^,\n\r]+)/i,
    /vendor:?\s*([^,\n\r]+)/i
  ]
};

// Common email receipt patterns
const EMAIL_RECEIPT_PATTERNS = [
  {
    sender: /square/i,
    subject: /receipt/i,
    merchant: /from (.+?) for/i,
    total: /total:\s*\$?([\d,.]+)/i
  },
  {
    sender: /uber/i,
    subject: /trip receipt|order receipt/i,
    total: /total:\s*\$?([\d,.]+)/i
  },
  {
    sender: /doordash/i,
    subject: /order from/i,
    merchant: /order from (.+?)(?: -|$)/i,
    total: /total:\s*\$?([\d,.]+)/i
  }
  // Add more patterns as needed
];

export class ContentExtractor {
  static async fromHtml(html: string, metadata?: any): Promise<ExtractionResult> {
    try {
      const $ = cheerio.load(html);
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      
      // Try known email receipt patterns first
      if (metadata?.from && metadata?.subject) {
        const receipt = this.tryEmailPatterns(
          metadata.from,
          metadata.subject,
          text
        );
        if (receipt) {
          return { receipt, metadata };
        }
      }

      // Fall back to generic extraction
      return {
        receipt: this.extractFromText(text),
        metadata
      };
    } catch (error) {
      Logger.error('HTML extraction failed', { error });
      return { error: 'Failed to parse HTML content' };
    }
  }

  static fromSMS(text: string, metadata?: any): ExtractionResult {
    try {
      // Handle common SMS receipt formats
      const lines = text.split('\n').map(line => line.trim());
      
      // Try to identify receipt-like structure
      if (!this.looksLikeReceipt(lines)) {
        return { error: 'Text does not appear to be a receipt' };
      }

      return {
        receipt: this.extractFromText(text),
        metadata
      };
    } catch (error) {
      Logger.error('SMS extraction failed', { error });
      return { error: 'Failed to parse SMS content' };
    }
  }

  private static tryEmailPatterns(
    from: string,
    subject: string,
    text: string
  ): ExtractedReceipt | null {
    for (const pattern of EMAIL_RECEIPT_PATTERNS) {
      if (pattern.sender.test(from) && pattern.subject.test(subject)) {
        const merchant = pattern.merchant ? 
          text.match(pattern.merchant)?.[1] : undefined;
        const total = pattern.total ? 
          parseFloat(text.match(pattern.total)?.[1] || '0') : undefined;

        if (merchant || total) {
          return {
            merchant: merchant ? normalizeMerchantName(merchant)[0] : undefined,
            total,
            date: this.findDate(text),
            confidence: 0.8 // Higher confidence for known patterns
          };
        }
      }
    }
    return null;
  }

  private static extractFromText(text: string): ExtractedReceipt {
    const receipt: ExtractedReceipt = { confidence: 0 };
    let matches = 0;

    // Find total amount
    for (const pattern of PATTERNS.total) {
      const match = text.match(pattern);
      if (match) {
        receipt.total = parseFloat(match[1].replace(/[,\s]/g, ''));
        matches++;
        break;
      }
    }

    // Find date
    for (const pattern of PATTERNS.date) {
      const match = text.match(pattern);
      if (match) {
        const parsed = this.parseDate(match[1]);
        if (parsed) {
          receipt.date = parsed;
          matches++;
          break;
        }
      }
    }

    // Find merchant
    for (const pattern of PATTERNS.merchant) {
      const match = text.match(pattern);
      if (match) {
        receipt.merchant = normalizeMerchantName(match[1])[0];
        matches++;
        break;
      }
    }

    // Calculate confidence based on matches
    receipt.confidence = matches / 3; // 3 is the number of fields we look for

    return receipt;
  }

  private static parseDate(dateStr: string): string | undefined {
    try {
      // Try different date formats
      const formats = [
        'M/d/yy',
        'M/d/yyyy',
        'yyyy-MM-dd',
        'dd/MM/yyyy',
        'MM-dd-yyyy'
      ];

      for (const format of formats) {
        const parsed = DateTime.fromFormat(dateStr, format);
        if (parsed.isValid) {
          return parsed.toISODate();
        }
      }

      // Try parsing as ISO date
      const isoDate = DateTime.fromISO(dateStr);
      if (isoDate.isValid) {
        return isoDate.toISODate();
      }
    } catch (error) {
      Logger.warn('Date parsing failed', { dateStr, error });
    }
    return undefined;
  }

  private static looksLikeReceipt(lines: string[]): boolean {
    // Heuristics to identify receipt-like text
    const hasAmount = lines.some(line => 
      /\$?\d+\.\d{2}/.test(line) || 
      /total|amount|paid/i.test(line)
    );
    
    const hasDate = lines.some(line => 
      /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(line) ||
      /date|purchased/i.test(line)
    );

    const hasMerchantIndicator = lines.some(line =>
      /merchant|store|restaurant|shop|vendor/i.test(line)
    );

    return hasAmount && (hasDate || hasMerchantIndicator);
  }
}

// Usage example:
/*
// Extract from HTML email
const htmlResult = await ContentExtractor.fromHtml(emailHtml, {
  from: 'receipts@square.com',
  subject: 'Receipt from Local Coffee Shop'
});

// Extract from SMS
const smsResult = ContentExtractor.fromSMS(
  'Your purchase from ACME Store\nTotal: $42.99\nDate: 3/15/2024',
  { from: '+1234567890' }
);
*/ 