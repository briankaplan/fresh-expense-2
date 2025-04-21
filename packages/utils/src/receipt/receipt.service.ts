import {
  AIModelDocument,
  AnalyticsDocument,
  BudgetDocument,
  CategoryDocument,
  ExpenseDocument,
  IntegrationDocument,
  MerchantDocument,
  OCRDocument,
  ReceiptDocument,
  ReportDocument,
  SearchDocument,
  SendgridDocument,
  SettingsDocument,
  SubscriptionDocument,
  TransactionDocument,
  UserDocument,
} from "@fresh-expense/types";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { ProcessorType } from "./processors/base.processor";
import type { ProcessorFactory } from "./processors/processor.factory";

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @InjectModel(SendgridDocument.name)
    private readonly sendgridModel: Model<SendgridDocument>,
    @InjectModel(ReceiptDocument.name)
    private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel(TransactionDocument.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(MerchantDocument.name)
    private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ExpenseDocument.name)
    private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel(CategoryDocument.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(BudgetDocument.name)
    private readonly budgetModel: Model<BudgetDocument>,
    @InjectModel(ReportDocument.name)
    private readonly reportModel: Model<ReportDocument>,
    @InjectModel(SubscriptionDocument.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(AnalyticsDocument.name)
    private readonly analyticsModel: Model<AnalyticsDocument>,
    @InjectModel(SearchDocument.name)
    private readonly searchModel: Model<SearchDocument>,
    @InjectModel(AIModelDocument.name)
    private readonly aiModelModel: Model<AIModelDocument>,
    @InjectModel(OCRDocument.name)
    private readonly ocrModel: Model<OCRDocument>,
    @InjectModel(IntegrationDocument.name)
    private readonly integrationModel: Model<IntegrationDocument>,
    @InjectModel(SettingsDocument.name)
    private readonly settingsModel: Model<SettingsDocument>,
    private readonly processorFactory: ProcessorFactory,
  ) { }

  async processSendGridMessage(messageId: string, options?: any): Promise<SendgridDocument> {
    try {
      const processor = this.processorFactory.createProcessor(ProcessorType.SENDGRID);
      return await processor.processSendGrid(messageId, options);
    } catch (error) {
      this.logger.error(`Error processing SendGrid message: ${error.message}`, error.stack);
      throw error;
    }
  }

  async processMessage(message: SendgridDocument, options?: any): Promise<ReceiptDocument> {
    try {
      const processor = this.processorFactory.createProcessor(message.provider as ProcessorType);
      return await processor.processReceipt(message, options);
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`, error.stack);
      throw error;
    }
  }

  async validateMessage(message: SendgridDocument): Promise<boolean> {
    try {
      const processor = this.processorFactory.createProcessor(message.provider as ProcessorType);
      return await processor.validateDocument(message);
    } catch (error) {
      this.logger.error(`Error validating message: ${error.message}`, error.stack);
      throw error;
    }
  }

  async enrichMessage(message: SendgridDocument): Promise<SendgridDocument> {
    try {
      const processor = this.processorFactory.createProcessor(message.provider as ProcessorType);
      return await processor.enrichDocument(message);
    } catch (error) {
      this.logger.error(`Error enriching message: ${error.message}`, error.stack);
      throw error;
    }
  }
}
