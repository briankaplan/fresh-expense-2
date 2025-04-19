import { ProcessingOptions, ProcessingResult, SmsDocument } from '@fresh-expense/types';

export abstract class BaseReceiptProcessor {
  abstract processSMS(doc: SmsDocument, options?: ProcessingOptions): Promise<ProcessingResult>;
} 