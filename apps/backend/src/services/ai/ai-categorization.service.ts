import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HfInference } from '@huggingface/inference';
import OpenAI from 'openai';
import { TRANSACTION_CATEGORIES, TransactionCategory } from '../../types/transaction.types';

interface CategoryResult {
  category: TransactionCategory;
  confidence: number;
  source: string;
}

interface HuggingFaceResponse {
  generated_text: string;
}

const isTransactionCategory = (value: unknown): value is TransactionCategory => {
  return typeof value === 'string' && Object.keys(TRANSACTION_CATEGORIES).includes(value as TransactionCategory);
};

@Injectable()
export class AiCategorizationService {
  private readonly logger = new Logger(AiCategorizationService.name);
  private readonly hf: HfInference | null;
  private readonly openai: OpenAI | null;

  constructor(private readonly configService: ConfigService) {
    const hfApiKey = this.configService.get<string>('HUGGING_FACE_API_KEY');
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

    this.hf = hfApiKey ? new HfInference(hfApiKey) : null;
    this.openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

    if (!this.hf && !this.openai) {
      this.logger.warn('No AI service configured. Categorization will use fallback logic.');
    }
  }

  /**
   * Categorizes a transaction using AI
   */
  async categorizeTransaction(transactionData: {
    description: string;
    merchant: string;
    amount: number;
    date: Date;
  }): Promise<CategoryResult> {
    try {
      if (!this.hf) {
        return {
          category: 'OTHER',
          confidence: 0.1,
          source: 'no_ai_available'
        };
      }

      const prompt = this.createPrompt(transactionData);
      
      const response = await this.hf.textGeneration({
        model: 'gpt2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 50,
          temperature: 0.7,
          return_full_text: false
        }
      }) as HuggingFaceResponse;

      if (!response?.generated_text) {
        return {
          category: 'OTHER',
          confidence: 0.3,
          source: 'no_valid_response'
        };
      }

      const { category, confidence } = this.parseAIResponse(response.generated_text);

      return {
        category,
        confidence,
        source: 'huggingface'
      };

    } catch (error) {
      this.logger.error('Error categorizing transaction:', error);
      return {
        category: 'OTHER',
        confidence: 0.3,
        source: 'ai_error'
      };
    }
  }

  /**
   * Creates a prompt for the AI model
   */
  private createPrompt(data: {
    description: string;
    merchant: string;
    amount: number;
    date: Date;
  }): string {
    return `Categorize this transaction:
Description: ${data.description}
Merchant: ${data.merchant}
Amount: ${data.amount}
Date: ${data.date.toISOString()}

Available categories:
${Object.entries(TRANSACTION_CATEGORIES)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Response format: Category key only (e.g., FOOD_AND_DINING)`;
  }

  /**
   * Parses the AI response and returns a category and confidence score
   */
  private parseAIResponse(response: string): {
    category: TransactionCategory;
    confidence: number;
  } {
    const cleanResponse = response.trim().toUpperCase();
    
    // Direct match
    for (const category of Object.keys(TRANSACTION_CATEGORIES)) {
      if (cleanResponse.includes(category)) {
        return {
          category: category as TransactionCategory,
          confidence: 0.95
        };
      }
    }

    // Fuzzy match
    let bestMatch = {
      category: 'OTHER' as TransactionCategory,
      similarity: 0
    };

    for (const category of Object.keys(TRANSACTION_CATEGORIES)) {
      const similarity = this.calculateSimilarity(cleanResponse, category);
      if (similarity > bestMatch.similarity) {
        bestMatch = {
          category: category as TransactionCategory,
          similarity
        };
      }
    }

    return {
      category: bestMatch.category,
      confidence: Math.max(0.3, bestMatch.similarity)
    };
  }

  /**
   * Calculates string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const costs = new Array();
    for (let i = 0; i <= shorter.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= longer.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (shorter[i - 1] !== longer[j - 1]) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[longer.length] = lastValue;
      }
    }
    return (longer.length - costs[shorter.length - 1]) / longer.length;
  }

  async categorizeWithOpenAI(description: string): Promise<CategoryResult | null> {
    try {
      if (!this.openai) {
        this.logger.warn('OpenAI client not initialized');
        return null;
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a transaction categorization assistant. Categorize the transaction into one of these categories:
${Object.entries(TRANSACTION_CATEGORIES)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Respond with ONLY the category key (e.g., FOOD_AND_DINING).`
          },
          {
            role: 'user',
            content: `Categorize this transaction: ${description}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      if (!response.choices[0]?.message?.content) {
        this.logger.warn('Invalid OpenAI response format');
        return null;
      }

      const category = response.choices[0].message.content.trim().toUpperCase() as TransactionCategory;
      if (!isTransactionCategory(category)) {
        this.logger.warn(`Invalid category returned from OpenAI: ${category}`);
        return null;
      }

      return {
        category,
        confidence: 0.9,
        source: 'openai'
      };

    } catch (error) {
      this.logger.error('Error calling OpenAI:', error);
      return null;
    }
  }
} 