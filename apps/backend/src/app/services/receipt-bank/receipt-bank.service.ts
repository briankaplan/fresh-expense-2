import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MemoryBankService } from '../memory-bank.service';
import { OCRService } from '../../../services/ocr/ocr.service';
import { R2Service } from '../../../services/r2/r2.service';
import { ReceiptConverterService } from '../receipt/receipt-converter.service';
import { Receipt, ReceiptDocument } from '../../receipts/schemas/receipt.schema';
import { Merchant } from '../../schemas/merchant.schema';
import { MerchantLearningService } from '../merchant/merchant-learning.service';
import * as puppeteer from 'puppeteer';

interface UnmatchedReceipt {
  id: string;
  source: 'EMAIL' | 'UPLOAD' | 'GOOGLE_VOICE';
  originalContent?: {
    from?: string;
    subject?: string;
    body?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>;
    extractedUrls: string[];
  };
  processedContent?: {
    receiptUrls?: string[];
    screenshots?: Buffer[];
    extractedText?: string;
    ocrResults?: any;
  };
  metadata: {
    processedAt: Date;
    lastMatchAttempt?: Date;
    matchAttempts: number;
    extractedData?: {
      merchant?: string;
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
    };
  };
}

interface ProcessReceiptOptions {
  source: 'EMAIL' | 'UPLOAD' | 'GOOGLE_VOICE';
  emailData?: {
    from: string;
    subject: string;
    body: string;
    attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }>;
  };
  uploadData?: {
    file: Buffer;
    filename: string;
    contentType: string;
  };
  googleVoiceData?: {
    from: string;
    message: string;
    timestamp: Date;
  };
}

@Injectable()
export class ReceiptBankService {
  private readonly logger = new Logger(ReceiptBankService.name);
  private browser: puppeteer.Browser | null = null;

  constructor(
    private readonly memoryBank: MemoryBankService,
    private readonly ocrService: OCRService,
    private readonly r2Service: R2Service,
    private readonly receiptConverter: ReceiptConverterService,
    private readonly merchantLearning: MerchantLearningService,
    @InjectModel(Receipt.name) private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel(Merchant.name) private readonly merchantModel: Model<Merchant>
  ) {}

  /**
   * Process a receipt from Google Voice SMS
   */
  async processGoogleVoiceSMS(from: string, subject: string, body: string): Promise<string> {
    const receiptId = `gv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract URLs from the message body
    const urls = this.extractUrls(body);
    
    const receipt: UnmatchedReceipt = {
      id: receiptId,
      source: 'GOOGLE_VOICE',
      originalContent: {
        from,
        subject,
        body,
        extractedUrls: urls
      },
      metadata: {
        processedAt: new Date(),
        matchAttempts: 0
      }
    };

    // Process any found URLs
    if (urls.length > 0) {
      const processedContent = await this.processReceiptUrls(urls);
      receipt.processedContent = processedContent;

      // If we got OCR results, try to extract structured data
      if (processedContent.ocrResults) {
        receipt.metadata.extractedData = await this.extractStructuredData(processedContent.ocrResults);
        
        // Store in database and update merchant data
        await this.storeReceipt(receipt);
      }
    }

    // Store in memory bank with 30-day TTL
    this.memoryBank.set(`receipt:${receiptId}`, receipt, {
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      tags: ['receipt', 'unmatched', 'google-voice'],
      source: 'google-voice'
    });

    return receiptId;
  }

  /**
   * Store receipt in database and update merchant learning
   */
  private async storeReceipt(receipt: UnmatchedReceipt): Promise<void> {
    const { extractedData } = receipt.metadata;
    if (!extractedData) return;

    // Store receipt in database
    const dbReceipt = new this.receiptModel({
      source: receipt.source,
      merchant: extractedData.merchant,
      amount: extractedData.amount,
      date: extractedData.date,
      items: extractedData.items,
      category: extractedData.category,
      metadata: {
        ocrConfidence: extractedData.confidence,
        isSubscription: extractedData.isSubscription,
        processedAt: receipt.metadata.processedAt,
        originalContent: receipt.originalContent,
        processedContent: {
          extractedText: receipt.processedContent?.extractedText,
          urls: receipt.processedContent?.receiptUrls
        }
      }
    });

    await dbReceipt.save();

    // Update merchant learning if we have a merchant name
    if (extractedData.merchant) {
      await this.merchantLearning.learnFromReceipt({
        merchantName: extractedData.merchant,
        amount: extractedData.amount,
        date: extractedData.date,
        items: extractedData.items,
        category: extractedData.category,
        isSubscription: extractedData.isSubscription,
        confidence: extractedData.confidence
      });
    }
  }

  /**
   * Extract structured data from OCR results using merchant learning
   */
  private async extractStructuredData(ocrResults: any) {
    const text = ocrResults.text;
    
    // Use merchant learning to identify merchant and extract data
    const merchantData = await this.merchantLearning.analyzeReceipt(text);
    
    return {
      merchant: merchantData.merchantName,
      amount: merchantData.amount || this.extractAmount(text),
      date: merchantData.date || this.extractDate(text),
      items: merchantData.items || this.extractItems(text),
      category: merchantData.category,
      isSubscription: merchantData.isSubscription,
      confidence: merchantData.confidence
    };
  }

  /**
   * Extract items from receipt text
   */
  private extractItems(text: string): Array<{ description: string; amount: number; category?: string }> {
    const lines = text.split('\n');
    const items: Array<{ description: string; amount: number; category?: string }> = [];
    
    // Common patterns for item lines
    const itemPatterns = [
      // Description followed by amount: "Item name    $XX.XX"
      /^(.+?)\s+[\$£€]?\s*([\d,.]+)\s*$/,
      // Amount followed by description: "$XX.XX    Item name"
      /^[\$£€]?\s*([\d,.]+)\s+(.+?)\s*$/
    ];

    let inItemsSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Look for section markers
      if (/items|products|description/i.test(trimmedLine)) {
        inItemsSection = true;
        continue;
      }
      
      if (/subtotal|total|tax|payment/i.test(trimmedLine)) {
        inItemsSection = false;
        continue;
      }
      
      if (inItemsSection) {
        for (const pattern of itemPatterns) {
          const match = trimmedLine.match(pattern);
          if (match) {
            const [_, part1, part2] = match;
            // Determine which part is the description and which is the amount
            const isAmountFirst = /^[\d,.]+$/.test(part1);
            const description = isAmountFirst ? part2 : part1;
            const amount = parseFloat((isAmountFirst ? part1 : part2).replace(/,/g, ''));
            
            if (!isNaN(amount) && description) {
              items.push({
                description: description.trim(),
                amount,
                // Category will be filled in by merchant learning service
                category: undefined
              });
            }
            break;
          }
        }
      }
    }

    return items;
  }

  /**
   * Process receipt URLs (download and screenshot)
   */
  private async processReceiptUrls(urls: string[]): Promise<UnmatchedReceipt['processedContent']> {
    const browser = await this.getBrowser();
    const processedContent: UnmatchedReceipt['processedContent'] = {
      receiptUrls: urls,
      screenshots: []
    };

    for (const url of urls) {
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Take a screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: true
        });
        processedContent.screenshots?.push(screenshot);

        // Get page content for OCR
        const content = await page.content();
        
        // Perform OCR on the screenshot
        const ocrResult = await this.ocrService.processImage(screenshot);
        processedContent.ocrResults = ocrResult;
        processedContent.extractedText = ocrResult.text;

        await page.close();
      } catch (error) {
        this.logger.error(`Error processing URL ${url}:`, error);
      }
    }

    return processedContent;
  }

  /**
   * Get or create Puppeteer browser instance
   */
  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  /**
   * Extract URLs from text
   */
  private extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }

  /**
   * Extract merchant name from OCR text
   */
  private extractMerchantName(text: string): string | undefined {
    const lines = text.split('\n');
    
    // Common patterns for merchant names
    const patterns = [
      /(?:merchant|store|business):\s*(.+)/i,
      /welcome to (.+)/i,
      /thank you for shopping at (.+)/i
    ];

    // Check first 5 lines for merchant name patterns
    for (const line of lines.slice(0, 5)) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          return match[1].trim();
        }
      }
    }

    // If no pattern matches, return first non-empty line
    return lines.find(line => line.trim().length > 0);
  }

  /**
   * Extract amount from OCR text
   */
  private extractAmount(text: string): number | undefined {
    const lines = text.split('\n');
    
    // Common patterns for total amounts
    const patterns = [
      /total:?\s*[\$£€]?\s*([\d,.]+)/i,
      /amount:?\s*[\$£€]?\s*([\d,.]+)/i,
      /[\$£€]\s*([\d,.]+)\s*$/,
      /([\d,.]+)\s*[\$£€]\s*$/
    ];

    // Search from bottom up as total is usually at the bottom
    for (const line of lines.reverse()) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          // Convert string amount to number, handling commas
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }

    return undefined;
  }

  /**
   * Extract date from OCR text
   */
  private extractDate(text: string): Date | undefined {
    const lines = text.split('\n');
    
    // Common date patterns
    const patterns = [
      // MM/DD/YYYY or DD/MM/YYYY
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
      // Month DD, YYYY
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2}),? (\d{4})/i,
      // YYYY-MM-DD
      /(\d{4})-(\d{2})-(\d{2})/
    ];

    // Check first 10 lines for date patterns
    for (const line of lines.slice(0, 10)) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          try {
            // Try to parse the date
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
   * Get all unmatched receipts
   */
  getUnmatchedReceipts(): UnmatchedReceipt[] {
    return this.memoryBank.findByTags(['receipt', 'unmatched'])
      .map(item => item.data as UnmatchedReceipt);
  }

  /**
   * Mark a receipt as matched
   */
  markAsMatched(receiptId: string): void {
    this.memoryBank.delete(`receipt:${receiptId}`);
  }

  /**
   * Update match attempt
   */
  updateMatchAttempt(receiptId: string): void {
    const receipt = this.memoryBank.get<UnmatchedReceipt>(`receipt:${receiptId}`);
    if (receipt) {
      receipt.metadata.lastMatchAttempt = new Date();
      receipt.metadata.matchAttempts++;
      this.memoryBank.update(`receipt:${receiptId}`, receipt);
    }
  }

  /**
   * Get merchant suggestions for unmatched text
   */
  async getMerchantSuggestions(text: string): Promise<Array<{ merchant: string; confidence: number }>> {
    return this.merchantLearning.suggestMerchants(text);
  }

  /**
   * Provide feedback for merchant learning
   */
  async provideMerchantFeedback(receiptId: string, correctMerchant: string, isCorrect: boolean): Promise<void> {
    const receipt = await this.receiptModel.findById(receiptId);
    if (!receipt) return;

    await this.merchantLearning.processFeedback({
      originalMerchant: receipt.merchant,
      correctMerchant,
      isCorrect,
      receiptText: receipt.metadata.processedContent?.extractedText,
      amount: receipt.amount,
      date: receipt.date,
      items: receipt.items
    });
  }

  /**
   * Process receipt from email
   */
  async processEmail(options: ProcessReceiptOptions): Promise<string> {
    if (!options.emailData) {
      throw new Error('Email data is required');
    }

    const receiptId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const { from, subject, body, attachments } = options.emailData;

    const receipt: UnmatchedReceipt = {
      id: receiptId,
      source: 'EMAIL',
      originalContent: {
        from,
        subject,
        body,
        attachments,
        extractedUrls: this.extractUrls(body)
      },
      metadata: {
        processedAt: new Date(),
        matchAttempts: 0
      }
    };

    // Process attachments
    const processedContent: UnmatchedReceipt['processedContent'] = {
      receiptUrls: [],
      screenshots: [],
      extractedText: ''
    };

    // Process each attachment
    for (const attachment of attachments) {
      if (this.isImageAttachment(attachment.contentType)) {
        // Process image attachment
        const ocrResult = await this.ocrService.processImage(attachment.content);
        processedContent.ocrResults = ocrResult;
        processedContent.extractedText = ocrResult.text;
      } else if (this.isPDFAttachment(attachment.contentType)) {
        // Upload PDF to R2 for storage
        const key = `receipts/${receiptId}/${attachment.filename}`;
        await this.r2Service.uploadFile(key, attachment.content, attachment.contentType);
        
        // Convert PDF to image and process with OCR
        const pdfImage = await this.receiptConverter.convertPDFToImage(attachment.content);
        const ocrResult = await this.ocrService.processImage(pdfImage);
        processedContent.ocrResults = ocrResult;
        processedContent.extractedText = ocrResult.text;
      }
    }

    receipt.processedContent = processedContent;

    // Extract structured data if we have OCR results
    if (processedContent.ocrResults) {
      receipt.metadata.extractedData = await this.extractStructuredData(processedContent.ocrResults);
      
      // Store in database and update merchant data
      await this.storeReceipt(receipt);
    }

    // Store in memory bank with 30-day TTL
    this.memoryBank.set(`receipt:${receiptId}`, receipt, {
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      tags: ['receipt', 'unmatched', 'email'],
      source: 'email'
    });

    return receiptId;
  }

  /**
   * Check if attachment is an image
   */
  private isImageAttachment(contentType: string): boolean {
    return /^image\/(jpeg|png|gif|webp)$/i.test(contentType);
  }

  /**
   * Check if attachment is a PDF
   */
  private isPDFAttachment(contentType: string): boolean {
    return contentType === 'application/pdf';
  }

  /**
   * Calculate match score between expense and receipt
   */
  private calculateMatchScore(expense: {
    merchant: string;
    amount: number;
    date: Date;
  }, receipt: {
    merchantName?: string;
    total?: number;
    date?: Date;
  }): number {
    let score = 0;

    // Check merchant name similarity
    if (receipt.merchantName && expense.merchant) {
      const merchantNameLower = receipt.merchantName.toLowerCase();
      const expenseMerchantLower = expense.merchant.toLowerCase();
      
      if (merchantNameLower === expenseMerchantLower) {
        score += 0.5; // Exact match
      } else if (merchantNameLower.includes(expenseMerchantLower) || 
                expenseMerchantLower.includes(merchantNameLower)) {
        score += 0.3; // Partial match
      }
    }

    // Check amount match
    if (receipt.total && expense.amount) {
      const amountDiff = Math.abs(receipt.total - expense.amount);
      const relativeDiff = amountDiff / expense.amount;
      
      if (amountDiff < 0.01) {
        score += 0.5; // Exact match
      } else if (relativeDiff < 0.05) {
        score += 0.3; // Within 5%
      } else if (relativeDiff < 0.10) {
        score += 0.1; // Within 10%
      }
    }

    // Check date proximity
    if (receipt.date && expense.date) {
      const daysDiff = Math.abs(Math.round(
        (receipt.date.getTime() - expense.date.getTime()) / (1000 * 60 * 60 * 24)
      ));
      
      if (daysDiff === 0) {
        score += 0.3; // Same day
      } else if (daysDiff <= 2) {
        score += 0.2; // Within 2 days
      } else if (daysDiff <= 5) {
        score += 0.1; // Within 5 days
      }
    }

    return Math.min(score, 1); // Cap at 1.0
  }

  /**
   * Find best matching receipt
   */
  private async findBestMatchingReceipt(expense: {
    merchant: string;
    amount: number;
    date: Date;
  }, receipts: Array<UnmatchedReceipt>): Promise<UnmatchedReceipt | null> {
    let bestMatch: UnmatchedReceipt | null = null;
    let bestScore = 0;

    for (const receipt of receipts) {
      const extractedData = receipt.metadata.extractedData;
      if (!extractedData) continue;

      const score = this.calculateMatchScore(expense, {
        merchantName: extractedData.merchant,
        total: extractedData.amount,
        date: extractedData.date
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = receipt;

        // Early exit if we find a very good match
        if (score >= 0.8) {
          break;
        }
      }
    }

    // Only return matches above a minimum threshold
    return bestScore >= 0.4 ? bestMatch : null;
  }

  /**
   * Cache receipt data
   */
  private async cacheReceipt(receipt: UnmatchedReceipt): Promise<void> {
    const cacheKey = `receipt:${receipt.id}`;
    await this.memoryBank.set(cacheKey, receipt, {
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      tags: ['receipt', receipt.source.toLowerCase()],
      source: receipt.source.toLowerCase()
    });
  }

  /**
   * Get cached receipts
   */
  private async getCachedReceipts(source?: string): Promise<UnmatchedReceipt[]> {
    const tags = ['receipt'];
    if (source) {
      tags.push(source.toLowerCase());
    }
    return this.memoryBank.findByTags(tags)
      .map(item => item.data as UnmatchedReceipt);
  }
} 