import { SMSProvider } from "@fresh-expense/types";
import { Injectable } from "@nestjs/common";
import type { BaseReceiptProcessor } from "./base.processor";
import { SendGridProcessor } from "./sendgrid.processor";

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
