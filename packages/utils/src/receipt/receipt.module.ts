import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Sendgrid,
  SendgridSchema,
  Receipt,
  ReceiptSchema,
  TransactionModel,
  TransactionSchema,
  Merchant,
  MerchantSchema,
  UserModel,
  UserSchema,
  Expense,
  ExpenseSchema,
  Category,
  CategorySchema,
  Budget,
  BudgetSchema,
  Report,
  ReportSchema,
  Subscription,
  SubscriptionSchema,
  Analytics,
  AnalyticsSchema,
  Search,
  SearchSchema,
  AIModel,
  AIModelSchema,
  OCR,
  OcrSchema,
  Integration,
  IntegrationSchema,
  Settings,
  SettingsSchema,
} from '@fresh-expense/types';

import { ProcessorFactory } from './processors/processor.factory';
import { SendGridProcessor } from './processors/sendgrid.processor';
import { ReceiptService } from './receipt.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sendgrid.name, schema: SendgridSchema },
      { name: Receipt.name, schema: ReceiptSchema },
      { name: TransactionModel.name, schema: TransactionSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: UserModel.name, schema: UserSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Analytics.name, schema: AnalyticsSchema },
      { name: Search.name, schema: SearchSchema },
      { name: AIModel.name, schema: AIModelSchema },
      { name: OCR.name, schema: OcrSchema },
      { name: Integration.name, schema: IntegrationSchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
  ],
  providers: [ProcessorFactory, SendGridProcessor, ReceiptService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
