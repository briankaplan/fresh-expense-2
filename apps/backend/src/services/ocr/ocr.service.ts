import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWorker, Worker } from 'tesseract.js';
import { HfInference } from '@huggingface/inference';
import type { Sharp } from 'sharp';
import sharp from 'sharp';

export interface OCRResult {
  text: string;
  confidence: number;
  merchant?: string;
  totalAmount?: number;
  date?: Date;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
}

interface ExtractedReceiptData {
  merchantName?: string;
  date?: Date;
  total?: number;
  items?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice: number;
  }>;
  taxAmount?: number;
  subtotal?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  confidence: number;
}

interface OCRConfig {
  handleMultipleLanguages: boolean;
  enhancePreprocessing: boolean;
  enableFieldDetection: boolean;
  handleHandwriting: boolean;
  enhanceFaded: boolean;
}

@Injectable()
export class OCRService {
  private readonly logger = new Logger(OCRService.name);
  private worker: Worker;
  private hf: HfInference;
  private readonly config: OCRConfig;
  private readonly apiKey: string;
  private readonly apiEndpoint: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const hfToken = this.configService.get<string>('HUGGINGFACE_API_TOKEN');
    
    if (hfToken) {
      this.hf = new HfInference(hfToken);
      this.logger.log('HuggingFace API client initialized for OCR service');
    }

    this.config = {
      handleMultipleLanguages: this.configService.get('OCR_HANDLE_MULTIPLE_LANGUAGES') === 'true',
      enhancePreprocessing: true,
      enableFieldDetection: true,
      handleHandwriting: true,
      enhanceFaded: true
    };

    this.apiKey = this.configService.get<string>('OCR_API_KEY') || '';
    this.apiEndpoint = this.configService.get<string>('OCR_API_ENDPOINT') || '';
  }

  async onModuleInit() {
    const languages = this.config.handleMultipleLanguages ? 
      'eng+fra+deu+spa' : 
      'eng';

    this.worker = await createWorker();
    await this.worker.reinitialize(languages);
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }

  /**
   * Process image with OCR
   */
  async processImage(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
    blocks: Array<{
      text: string;
      confidence: number;
      bbox: { x0: number; y0: number; x1: number; y1: number };
    }>;
  }> {
    try {
      const worker = await this.getWorker();
      
      // Preprocess image if enabled
      const processedBuffer = this.config.enhancePreprocessing
        ? await this.enhanceImage(imageBuffer)
        : imageBuffer;
      
      // Recognize text
      const result = await worker.recognize(processedBuffer);
      
      // Extract blocks with position information
      const blocks = result.data.blocks.map(block => ({
        text: block.text,
        confidence: block.confidence,
        bbox: block.bbox
      }));

      return {
        text: result.data.text,
        confidence: result.data.confidence / 100,
        blocks
      };
    } catch (error) {
      this.logger.error('Error processing image with OCR:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  async onApplicationShutdown() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Enhance image for better OCR results
   */
  private async enhanceImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      return await image
        .grayscale()
        .linear(1.5, -0.2)
        .sharpen({
          sigma: 2,
          m1: 0,
          m2: 3,
          x1: 3,
          y2: 15,
          y3: 15
        })
        .median(1)
        .png()
        .toBuffer();
    } catch (error) {
      this.logger.error('Error enhancing image:', error);
      throw error;
    }
  }

  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      return await image
        .grayscale()
        .linear(1.5, -0.2) // Increase contrast
        .sharpen({
          sigma: 2,
          m1: 0,
          m2: 3,
          x1: 3,
          y2: 15,
          y3: 15
        })
        .median(1) // Remove noise
        .png()
        .toBuffer();
    } catch (error) {
      this.logger.error('Error preprocessing image:', error);
      throw error;
    }
  }

  private async processWithHuggingFace(imageBuffer: Buffer): Promise<{ text: string }> {
    try {
      return await this.hf.ocr({
        model: 'microsoft/trocr-base-printed',
        data: imageBuffer
      });
    } catch (error) {
      this.logger.error('Error processing with HuggingFace:', error);
      throw error;
    }
  }

  private parseOCRResult(text: string, confidence = 0.95): OCRResult {
    // Split text into lines
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    return {
      text: lines.join('\n'),
      merchant: this.extractMerchant(lines),
      date: this.extractDate(lines),
      totalAmount: this.extractAmount(text),
      items: this.extractItems(lines),
      confidence,
    };
  }

  private extractMerchant(lines: string[]): string | undefined {
    // Usually the merchant name is in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (
        line &&
        !line.match(/^\d/) && // Doesn't start with number
        !line.match(/\d{2}[/-]\d{2}[/-]\d{2,4}/) && // Not a date
        !line.match(/^(tel|fax|phone)/i) && // Not contact info
        !line.match(/^(http|www)/i) // Not a website
      ) {
        return line;
      }
    }
    return undefined;
  }

  private extractDate(lines: string[]): Date | undefined {
    const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/;
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) {
        return new Date(match[1]);
      }
    }
    return undefined;
  }

  private extractAmount(text: string): number | undefined {
    const amountRegex = /\$?\d+\.\d{2}/;
    const match = text.match(amountRegex);
    return match ? parseFloat(match[0].replace('$', '')) : undefined;
  }

  private extractItems(lines: string[]): Array<{ description: string; amount: number }> {
    const items: Array<{ description: string; amount: number }> = [];
    let inItemSection = false;
    const itemRegex = /^(.*?)\s+[\$£€]?\s*(\d+[.,]\d{2})\s*$/;

    for (const line of lines) {
      // Skip header lines
      if (line.toLowerCase().includes('item') || line.toLowerCase().includes('description')) {
        inItemSection = true;
        continue;
      }

      // Stop when we hit the totals section
      if (line.toLowerCase().includes('subtotal') || line.toLowerCase().includes('total')) {
        break;
      }

      if (inItemSection) {
        const match = line.match(itemRegex);
        if (match) {
          items.push({
            description: match[1].trim(),
            amount: parseFloat(match[2].replace(',', '.'))
          });
        }
      }
    }

    return items;
  }

  /**
   * Extract structured data from receipt text using AI
   */
  async extractReceiptData(text: string): Promise<ExtractedReceiptData> {
    try {
      if (!this.hf) {
        throw new Error('HuggingFace API not initialized');
      }

      const prompt = `Extract the following information from this receipt:
${text}

Please provide:
- Merchant name
- Date
- Total amount
- Individual items with prices
- Tax amount
- Payment method
- Receipt number

Format as JSON.`;

      const response = await this.hf.textGeneration({
        model: 'gpt2', // Replace with your preferred model
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          return_full_text: false
        }
      });

      // Parse the AI response
      const extractedData = this.parseAIResponse(response.generated_text);
      return {
        ...extractedData,
        confidence: this.calculateConfidence(text)
      };
    } catch (error) {
      this.logger.error('Error extracting receipt data:', error);
      throw new Error('Failed to extract receipt data');
    }
  }

  /**
   * Calculate confidence score based on text quality
   */
  private calculateConfidence(text: string): number {
    // Basic confidence calculation based on text characteristics
    let confidence = 1.0;

    // Reduce confidence for very short texts
    if (text.length < 50) confidence *= 0.7;

    // Reduce confidence for texts with too many special characters
    const specialCharRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
    if (specialCharRatio > 0.3) confidence *= 0.8;

    // Reduce confidence for texts with too many numbers
    const numberRatio = (text.match(/\d/g) || []).length / text.length;
    if (numberRatio > 0.5) confidence *= 0.9;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Parse AI response into structured data
   */
  private parseAIResponse(text: string): Partial<ExtractedReceiptData> {
    try {
      // Attempt to parse as JSON first
      return JSON.parse(text);
    } catch {
      // Fallback to regex-based parsing if JSON parsing fails
      const data: Partial<ExtractedReceiptData> = {};
      
      // Extract merchant name (usually at the top)
      const merchantMatch = text.match(/^(.+?)\n/);
      if (merchantMatch) data.merchantName = merchantMatch[1].trim();

      // Extract date
      const dateMatch = text.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
      if (dateMatch) data.date = new Date(dateMatch[0]);

      // Extract total amount
      const totalMatch = text.match(/total[\s:]*[$]?\s*(\d+\.?\d*)/i);
      if (totalMatch) data.total = parseFloat(totalMatch[1]);

      return data;
    }
  }

  private async getWorker(): Promise<Worker> {
    if (!this.worker) {
      await this.onModuleInit();
    }
    return this.worker;
  }

  async processReceipt(buffer: Buffer): Promise<OCRResult> {
    try {
      // Convert buffer to base64
      const base64Image = buffer.toString('base64');

      // Call OCR API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          image: base64Image,
          type: 'receipt',
        }),
      });

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract relevant information
      const result: OCRResult = {
        text: data.text || '',
        confidence: data.confidence || 0,
      };

      // Extract merchant name
      if (data.merchant?.name) {
        result.merchant = data.merchant.name;
      }

      // Extract total amount
      if (data.total?.amount) {
        result.totalAmount = parseFloat(data.total.amount);
      }

      // Extract date
      if (data.date) {
        result.date = new Date(data.date);
      }

      // Extract line items
      if (Array.isArray(data.items)) {
        result.items = data.items.map(item => ({
          description: item.description || '',
          amount: parseFloat(item.amount) || 0,
          quantity: item.quantity ? parseInt(item.quantity) : undefined,
        }));
      }

      return result;
    } catch (error) {
      this.logger.error('Error processing receipt with OCR:', error);
      throw error;
    }
  }
} 