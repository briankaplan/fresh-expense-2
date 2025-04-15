import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config.service';
import { RateLimiterService } from '../rate-limiter.service';
import { ErrorHandlerService } from '../error-handler.service';
import { LoggingService } from '../logging.service';
import { BaseAIService } from './base-ai.service';

export interface ExtractedReceiptInfo {
  merchant: string;
  date: string;
  total: number;
  items: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  tax?: number;
  tip?: number;
  subtotal?: number;
  confidence: number;
}

@Injectable()
export class ExtractionService extends BaseAIService {
  constructor(
    configService: ConfigService,
    rateLimiter: RateLimiterService,
    errorHandler: ErrorHandlerService,
    logger: LoggingService
  ) {
    super(configService, rateLimiter, errorHandler, logger, ExtractionService.name);
    this.initializeClient('https://api-inference.huggingface.co/models', {
      Authorization: `Bearer ${configService.getAIConfig().huggingface.apiKey}`,
    });
  }

  async extractReceiptInfo(text: string): Promise<ExtractedReceiptInfo> {
    return this.withRateLimit('AI.HUGGINGFACE.INFERENCE', async () => {
      const response = await this.client.post('/microsoft/layoutlm-base-uncased', {
        inputs: text,
      });

      // Process and structure the response
      const result: ExtractedReceiptInfo = {
        merchant: '',
        date: '',
        total: 0,
        items: [],
        confidence: 0,
      };

      // Extract merchant name (usually at the top)
      const lines = text.split('\n');
      if (lines.length > 0) {
        result.merchant = lines[0].trim();
      }

      // Extract date (look for date patterns)
      const dateMatch = text.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
      if (dateMatch) {
        result.date = dateMatch[0];
      }

      // Extract total amount (look for patterns like "Total: $XX.XX")
      const totalMatch = text.match(/total:?\s*\$?(\d+\.?\d*)/i);
      if (totalMatch) {
        result.total = parseFloat(totalMatch[1]);
      }

      // Extract items (look for patterns like "Item $XX.XX" or similar)
      const itemPattern = /(.+?)\s+\$?(\d+\.?\d*)/g;
      let itemMatch;
      while ((itemMatch = itemPattern.exec(text)) !== null) {
        if (!itemMatch[1].toLowerCase().includes('total')) {
          result.items.push({
            description: itemMatch[1].trim(),
            amount: parseFloat(itemMatch[2]),
          });
        }
      }

      // Set confidence based on how much we were able to extract
      result.confidence = this.calculateConfidence(result);

      return result;
    });
  }

  private calculateConfidence(result: ExtractedReceiptInfo): number {
    let score = 0;

    if (result.merchant) score += 0.2;
    if (result.date) score += 0.2;
    if (result.total > 0) score += 0.3;
    if (result.items.length > 0) score += 0.3;

    return score;
  }
}
