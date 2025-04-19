import { OpenAI } from 'openai';

interface ExtractedData {
  merchant: string;
  amount: number;
  date: Date;
  items?: Array<{
    description: string;
    amount: number;
  }>;
  tax?: number;
  total?: number;
}

export class AIExtractionService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async extractReceiptData(text: string): Promise<ExtractedData> {
    try {
      const prompt = `Extract receipt data from the following text. Return only JSON with the following structure:
      {
        "merchant": string,
        "amount": number,
        "date": string (ISO format),
        "items": [{ "description": string, "amount": number }],
        "tax": number,
        "total": number
      }
      
      Text: ${text}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a receipt data extraction assistant. Extract structured data from receipt text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
      });

      const extracted = JSON.parse(response.choices[0].message.content);

      return {
        ...extracted,
        date: new Date(extracted.date),
      };
    } catch (error) {
      throw new Error('AI extraction failed');
    }
  }
}
