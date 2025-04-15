import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { OCRService } from '../../../services/ocr/ocr.service';
import NodeCache from 'node-cache';
import { createWorker } from 'tesseract.js';
import { ProcessedData } from './types/processed-data.interface';
import { ExtractedReceiptData } from './types/extracted-receipt-data.interface';

interface ConversionOptions {
  width?: number;
  height?: number;
  quality?: number;
}

interface BatchProcessingOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  maxConcurrent?: number;
  maxRetries?: number;
}

interface VerificationResult {
  score: number;
  merchantMatch: boolean;
  amountMatch: boolean;
  dateMatch: boolean;
  itemsMatch?: boolean;
  isMatch: boolean;
  merchantScore: number;
  amountScore: number;
  dateScore: number;
  itemsScore?: number;
  details: {
    transactionId?: string;
    paymentMethod?: string;
    tax?: number;
  };
}

interface EmailAttachment {
  content: Buffer;
  filename: string;
  contentType: string;
}

@Injectable()
export class ReceiptConverterService {
  private readonly logger = new Logger(ReceiptConverterService.name);
  private readonly cache: NodeCache;
  private readonly processingQueue: Array<{
    item: Buffer;
    filename: string;
    expectedData?: ExtractedReceiptData;
    resolve: (value: ProcessedData) => void;
    reject: (error: Error) => void;
  }> = [];
  private isProcessing = false;
  private readonly datePatterns = [
    /(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/, // MM/DD/YYYY, DD/MM/YYYY, etc.
    /(?:date|dated)(?:[:\s]+)(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i, // Date: MM/DD/YYYY
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i, // 01 Jan 2023
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\s*,?\s*\d{2,4}/i, // Jan. 01, 2023
    /(\d{4}-\d{2}-\d{2})/, // YYYY-MM-DD
  ];

  private readonly amountPatterns = [
    /(?:total|amount|sum|due|balance)[^0-9$]*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    /(?:total|amount|sum|due|balance)[^0-9$]*[$]?\s*(\d+\.\d{2})/i,
    /(?:^|[\s\n])[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})(?:\s*(?:total|amount|due))/i,
    /(?:grand\s+total)[^0-9$]*[$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/i,
    /(?:grand\s+total)[^0-9$]*[$]?\s*(\d+\.\d{2})/i,
  ];

  private readonly merchantCache: NodeCache;
  private readonly receiptCache: NodeCache;

  constructor(
    private readonly ocrService: OCRService,
    private readonly options: BatchProcessingOptions = {}
  ) {
    this.cache = new NodeCache({
      stdTTL: 3600, // 1 hour default
      checkperiod: 120, // Check for expired keys every 2 minutes
    });
    this.merchantCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
    this.receiptCache = new NodeCache({ stdTTL: 86400 }); // 24 hour cache
  }

  private async getCached(key: string): Promise<ProcessedData | undefined> {
    return this.cache.get(key);
  }

  private async setCached(key: string, value: ProcessedData, ttl = 3600): Promise<boolean> {
    return this.cache.set(key, value, ttl);
  }

  private async invalidateCache(pattern: string): Promise<void> {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((key: string) => key.match(pattern));
    this.cache.del(matchingKeys);
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processWithRetry<T>(
    item: T,
    processor: (item: T) => Promise<ProcessedData>,
    maxRetries = 3
  ): Promise<ProcessedData> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await processor(item);
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  private async addToQueue(
    buffer: Buffer,
    filename: string,
    expectedData?: ExtractedReceiptData
  ): Promise<ProcessedData> {
    return new Promise((resolve, reject) => {
      this.processingQueue.push({ item: buffer, filename, expectedData, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const batchSize = this.options.batchSize || 10;
    const maxConcurrent = this.options.maxConcurrent || 3;
    const batch = this.processingQueue.splice(0, Math.min(batchSize, maxConcurrent));

    try {
      const results = await Promise.all(
        batch.map(({ item, filename, expectedData }) =>
          this.processWithRetry(
            { buffer: item, filename, expectedData },
            async ({ buffer, filename, expectedData }) => {
              const cacheKey = `receipt:${filename}:${buffer.toString('base64').slice(0, 32)}`;
              const cached = await this.getCached(cacheKey);
              if (cached) return cached;

              const fileObj: Express.Multer.File = {
                fieldname: 'file',
                originalname: filename,
                encoding: '7bit',
                mimetype: 'application/octet-stream',
                buffer,
                size: buffer.length,
                stream: null as any,
                destination: '',
                filename: filename,
                path: '',
              };

              const result = await this.processUploadedFile(fileObj);
              await this.setCached(cacheKey, result);
              return result;
            },
            this.options.maxRetries
          )
        )
      );

      batch.forEach(({ resolve }, index) => resolve(results[index]));
    } catch (error) {
      batch.forEach(({ reject }) => reject(error as Error));
    } finally {
      this.isProcessing = false;
      if (this.processingQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  async processBatch(
    items: Array<{ buffer: Buffer; filename: string; expectedData?: ExtractedReceiptData }>
  ): Promise<Array<ProcessedData>> {
    const batchSize = this.options.batchSize || 10;
    const delayBetweenBatches = this.options.delayBetweenBatches || 1000;
    const batches = this.createBatches(items, batchSize);
    const results: ProcessedData[] = [];

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(({ buffer, filename, expectedData }) =>
          this.addToQueue(buffer, filename, expectedData)
        )
      );
      results.push(...batchResults);

      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    return results;
  }

  /**
   * Convert HTML content to PDF
   */
  async htmlToPdf(html: string, options: ConversionOptions = {}): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html);

      const pdf = await page.pdf({
        width: options.width ? `${options.width}px` : undefined,
        height: options.height ? `${options.height}px` : undefined,
        printBackground: true,
        format: options.width ? undefined : 'A4',
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }

  /**
   * Convert PDF to image
   */
  async pdfToImage(
    pdfBuffer: Buffer,
    options: ConversionOptions = {}
  ): Promise<{ buffer: Buffer; pages: number }> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPageCount();

    // For now, we only convert the first page
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    // Create a new document with just the first page
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [0]);
    singlePageDoc.addPage(copiedPage);

    const singlePageBuffer = await singlePageDoc.save();

    // Convert to image using sharp
    const image = await sharp(singlePageBuffer)
      .resize(options.width || width, options.height || height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png({ quality: options.quality || 100 })
      .toBuffer();

    return { buffer: image, pages };
  }

  /**
   * Generate image preview
   */
  async generatePreview(
    buffer: Buffer,
    mimeType: string,
    options: ConversionOptions = {}
  ): Promise<Buffer> {
    if (mimeType === 'application/pdf') {
      const { buffer: imageBuffer } = await this.pdfToImage(buffer, options);
      return imageBuffer;
    }

    // For images, just resize
    return sharp(buffer)
      .resize(options.width || 800, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: options.quality || 80 })
      .toBuffer();
  }

  private calculateMerchantScore(found: string | null, expected: string | null): number {
    if (!found || !expected) return 0;

    // Clean both strings
    const cleanFound = found.toLowerCase().trim();
    const cleanExpected = expected.toLowerCase().trim();

    // Exact match
    if (cleanFound === cleanExpected) return 1;

    // Remove common suffixes and prefixes
    const cleanFoundNoSuffix = cleanFound
      .replace(/^(?:TST\*|DD\s+|THE\s+)/, '')
      .replace(/\.(?:COM|NET|ORG).*$/i, '')
      .replace(/\/.*$/, '')
      .replace(/\s*(?:INC|LLC|LTD|CORP|CORPORATION|COMPANY)\.?$/i, '')
      .replace(/\s*-\s*.*$/, '')
      .replace(/\s+PRO$/i, '')
      .trim();

    const cleanExpectedNoSuffix = cleanExpected
      .replace(/^(?:TST\*|DD\s+|THE\s+)/, '')
      .replace(/\.(?:COM|NET|ORG).*$/i, '')
      .replace(/\/.*$/, '')
      .replace(/\s*(?:INC|LLC|LTD|CORP|CORPORATION|COMPANY)\.?$/i, '')
      .replace(/\s*-\s*.*$/, '')
      .replace(/\s+PRO$/i, '')
      .trim();

    // Exact match after cleaning
    if (cleanFoundNoSuffix === cleanExpectedNoSuffix) return 0.95;

    // Check if one contains the other
    if (
      cleanFoundNoSuffix.includes(cleanExpectedNoSuffix) ||
      cleanExpectedNoSuffix.includes(cleanFoundNoSuffix)
    ) {
      return 0.9;
    }

    // Calculate word overlap
    const foundWords = new Set(cleanFoundNoSuffix.split(/\s+/));
    const expectedWords = new Set(cleanExpectedNoSuffix.split(/\s+/));
    const overlap = [...foundWords].filter(word => expectedWords.has(word)).length;
    const totalWords = Math.max(foundWords.size, expectedWords.size);

    if (totalWords === 0) return 0;
    return overlap / totalWords;
  }

  private calculateAmountScore(found: number | null, expected: number | null): number {
    if (!found || !expected) return 0;

    // Exact match
    if (Math.abs(found - expected) < 0.01) return 1;

    // Close match (within 1%)
    if (Math.abs(found - expected) / expected < 0.01) return 0.95;

    // Within 5%
    if (Math.abs(found - expected) / expected < 0.05) return 0.9;

    // Within 10%
    if (Math.abs(found - expected) / expected < 0.1) return 0.8;

    return 0;
  }

  private calculateDateScore(date1: Date | null, date2: Date | null): number {
    if (!date1 || !date2) return 0;
    return Math.abs(date1.getTime() - date2.getTime()) <= 24 * 60 * 60 * 1000 ? 1 : 0;
  }

  private calculateItemsScore(extractedItems: string[], expectedItems: string[]): number {
    if (!extractedItems || extractedItems.length === 0) return 0;

    const extractedSet = new Set(extractedItems.map(item => item.toLowerCase()));
    const expectedSet = new Set(expectedItems.map(item => item.toLowerCase()));

    const intersection = new Set([...extractedSet].filter(x => expectedSet.has(x)));
    return intersection.size / Math.max(extractedSet.size, expectedSet.size);
  }

  private verifyReceipt(
    extracted: ExtractedReceiptData,
    expected: {
      merchant?: string;
      amount?: number;
      date?: Date | null;
      items?: string[];
    }
  ): VerificationResult {
    const merchantScore = this.calculateMerchantScore(extracted.merchant, expected.merchant ?? '');
    const amountScore = this.calculateAmountScore(extracted.amount, expected.amount ?? 0);
    const dateScore = this.calculateDateScore(extracted.date, expected.date ?? null);
    const itemsScore = expected.items
      ? this.calculateItemsScore(extracted.items, expected.items)
      : undefined;

    const overallScore =
      (merchantScore + amountScore + dateScore + (itemsScore ?? 0)) /
      (itemsScore !== undefined ? 4 : 3);

    return {
      score: overallScore,
      merchantMatch: merchantScore >= 0.8,
      amountMatch: amountScore >= 0.8,
      dateMatch: dateScore >= 0.8,
      itemsMatch: itemsScore !== undefined ? itemsScore >= 0.8 : undefined,
      isMatch: overallScore >= 0.8,
      merchantScore,
      amountScore,
      dateScore,
      itemsScore,
      details: {
        transactionId: extracted.transactionId,
        paymentMethod: extracted.paymentMethod,
        tax: extracted.tax,
      },
    };
  }

  private extractMerchantName(text: string): string | undefined {
    const lines = text.split('\n');
    if (lines.length > 0) {
      // Look at the first few lines for the merchant name
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        // Skip short lines or those containing common non-merchant terms
        if (line.length > 3 && !line.match(/receipt|invoice|order|phone|fax|www|http/i)) {
          return line;
        }
      }
    }
    return undefined;
  }

  private extractDate(text: string): Date | undefined {
    for (const pattern of this.datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return new Date(match[1] || match[0]);
        } catch (e) {
          this.logger.warn(`Failed to parse date: ${match[1] || match[0]}`);
        }
      }
    }
    return undefined;
  }

  private extractAmount(text: string): number | undefined {
    for (const pattern of this.amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return parseFloat(match[1].replace(/,/g, ''));
        } catch (e) {
          this.logger.warn(`Failed to parse amount: ${match[1]}`);
        }
      }
    }
    return undefined;
  }

  private normalizeMerchant(merchant: string): string {
    // Check cache first
    const cacheKey = `merchant:${merchant}`;
    const cached = this.merchantCache.get<string>(cacheKey);
    if (cached) return cached;

    // Convert to lowercase and remove special characters
    const normalized = merchant.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Common merchant name variations
    const variations = {
      doordash: ['door dash', 'door-dash', 'doordash.com', 'door dash order'],
      uber: ['uber.com', 'uber eats', 'uber-eats', 'uber receipt'],
      amazon: ['amazon.com', 'amazon prime', 'amazon order'],
      apple: ['apple.com', 'apple bill', 'apple receipt'],
      spotify: ['spotify usa', 'spotify.com', 'spotify receipt'],
      starbucks: ['starbucks coffee', 'starbucks.com', 'starbucks order'],
    };

    // Check for exact matches first
    for (const [standard, vars] of Object.entries(variations)) {
      if (normalized === standard || vars.includes(normalized)) {
        this.merchantCache.set(cacheKey, standard);
        return standard;
      }
    }

    // If no exact match, try fuzzy matching
    let bestMatch = null;
    let bestScore = 0;

    for (const [standard, vars] of Object.entries(variations)) {
      const standardScore = this.calculateStringSimilarity(normalized, standard) * 1.2;
      if (standardScore > bestScore) {
        bestScore = standardScore;
        bestMatch = standard;
      }

      for (const variation of vars) {
        const variationScore = this.calculateStringSimilarity(normalized, variation);
        if (variationScore > bestScore) {
          bestScore = variationScore;
          bestMatch = standard;
        }
      }
    }

    if (bestScore >= 0.8 && bestMatch) {
      this.logger.debug(
        `Found fuzzy match: ${normalized} -> ${bestMatch} (score: ${bestScore.toFixed(2)})`
      );
      this.merchantCache.set(cacheKey, bestMatch);
      return bestMatch;
    }

    this.merchantCache.set(cacheKey, normalized);
    return normalized;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - distance / maxLength;
  }

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

  private amountsMatch(amount1: number, amount2: number): boolean {
    return Math.abs(amount1 - amount2) <= 0.02;
  }

  private datesMatch(date1: Date, date2: Date): boolean {
    // Same day
    if (date1.toDateString() === date2.toDateString()) {
      return true;
    }

    // Within 1 day
    const diffDays = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  }

  private async extractTextFromAttachment(attachment: EmailAttachment): Promise<string> {
    const worker = await createWorker();
    try {
      const {
        data: { text },
      } = await worker.recognize(attachment.content);
      return text;
    } finally {
      await worker.terminate();
    }
  }

  private async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    const worker = await createWorker();
    try {
      const {
        data: { text },
      } = await worker.recognize(file.buffer);
      return text;
    } finally {
      await worker.terminate();
    }
  }

  private parseCSV(file: Express.Multer.File): string {
    const csvData = file.buffer.toString('utf-8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Find relevant columns
    const merchantIndex = headers.findIndex(
      h => h.toLowerCase().includes('merchant') || h.toLowerCase().includes('store')
    );
    const amountIndex = headers.findIndex(
      h => h.toLowerCase().includes('amount') || h.toLowerCase().includes('total')
    );
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));

    // Process first data row
    const data = lines[1].split(',').map(d => d.trim());

    return JSON.stringify({
      merchant: merchantIndex >= 0 ? data[merchantIndex] : null,
      amount: amountIndex >= 0 ? parseFloat(data[amountIndex]) : null,
      date: dateIndex >= 0 ? new Date(data[dateIndex].replace(/\s+/g, 'T')) : null,
    });
  }

  async processEmailAttachment(
    attachment: EmailAttachment,
    expectedData?: {
      merchant?: string;
      amount?: number;
      date?: Date;
      items?: string[];
    }
  ): Promise<ProcessedData> {
    const text = await this.extractTextFromAttachment(attachment);
    const extracted = await this.extractReceiptData(text);

    const result: ProcessedData = {
      merchant: extracted.merchant ?? '',
      amount: extracted.amount ?? 0,
      date: extracted.date ?? undefined,
      items: extracted.items,
    };

    if (expectedData) {
      result.verification = this.verifyReceipt(extracted, expectedData);
    }

    return result;
  }

  async processUploadedFile(
    file: Express.Multer.File,
    expectedData?: {
      merchant?: string;
      amount?: number;
      date?: Date;
      items?: string[];
    }
  ): Promise<ProcessedData> {
    const text = await this.extractTextFromFile(file);
    const extracted = await this.extractReceiptData(text);

    const result: ProcessedData = {
      merchant: extracted.merchant ?? '',
      amount: extracted.amount ?? 0,
      date: extracted.date ?? undefined,
      items: extracted.items,
    };

    if (expectedData) {
      result.verification = this.verifyReceipt(extracted, expectedData);
    }

    return result;
  }

  async processCSVFile(
    file: Express.Multer.File,
    expectedData?: {
      merchant?: string;
      amount?: number;
      date?: Date;
      items?: string[];
    }
  ): Promise<ProcessedData> {
    const csvData = this.parseCSV(file);
    const extracted = await this.extractReceiptData(csvData);

    const result: ProcessedData = {
      merchant: extracted.merchant ?? '',
      amount: extracted.amount ?? 0,
      date: extracted.date ?? undefined,
      items: extracted.items,
    };

    if (expectedData) {
      result.verification = this.verifyReceipt(extracted, expectedData);
    }

    return result;
  }

  private async extractReceiptData(text: string): Promise<ExtractedReceiptData> {
    // Implementation of receipt data extraction
    return {
      merchant: null,
      date: null,
      amount: null,
      items: [],
      transactionId: undefined,
      paymentMethod: undefined,
      tax: undefined,
    };
  }
}
