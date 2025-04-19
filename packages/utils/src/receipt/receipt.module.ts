import {
  AIModel,
  AIModelSchema,
  Analytics,
  AnalyticsSchema,
  Budget,
  BudgetSchema,
  Category,
  CategorySchema,
  Expense,
  ExpenseSchema,
  Integration,
  IntegrationSchema,
  Merchant,
  MerchantSchema,
  OCR,
  OcrSchema,
  Receipt,
  ReceiptSchema,
  Report,
  ReportSchema,
  Search,
  SearchSchema,
  Sendgrid,
  SendgridSchema,
  Settings,
  SettingsSchema,
  Subscription,
  SubscriptionSchema,
  TransactionModel,
  TransactionSchema,
  UserModel,
  UserSchema,
} from "@fresh-expense/types";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ProcessorFactory } from "./processors/processor.factory";
import { SendGridProcessor } from "./processors/sendgrid.processor";
import { ReceiptService } from "./receipt.service";

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
