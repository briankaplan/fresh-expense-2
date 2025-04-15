import { HfInference } from '@huggingface/inference';

declare module '@huggingface/inference' {
  export class HfInference {
    constructor(token: string);
    
    ocr(params: {
      model: string;
      data: Buffer;
    }): Promise<{ text: string }>;

    textGeneration(params: {
      model: string;
      inputs: string;
      parameters?: {
        max_new_tokens?: number;
        temperature?: number;
        return_full_text?: boolean;
      };
    }): Promise<{ generated_text: string }>;

    imageToText(params: {
      data: Buffer;
      model: string;
    }): Promise<{
      text: string;
      confidence: number;
    }>;

    textClassification(params: {
      model: string;
      inputs: string;
      parameters: {
        candidate_labels: string[];
      };
    }): Promise<Array<{
      label: string;
      score: number;
    }>>;
  }
} 