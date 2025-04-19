import { Injectable } from '@nestjs/common';
import { BaseReceiptProcessor } from './base.processor';
import { SendGridProcessor } from './sendgrid.processor';
import { SMSProvider } from '@fresh-expense/types';

@Injectable()
export class ProcessorFactory {
  createProcessor(provider: SMSProvider): BaseReceiptProcessor {
    switch (provider) {
      case SMSProvider.SENDGRID:
        return new SendGridProcessor();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
