import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MigrationDocument } from './schemas/migration.schema';
import {
  UserDocument,
  TransactionDocument,
  ExpenseDocument,
  ReceiptDocument,
  SubscriptionDocument,
  ReportDocument,
  MerchantDocument,
  AIModelDocument,
  OCRDocument,
  AnalyticsDocument,
} from '@fresh-expense/types';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectModel('Migration') private readonly migrationModel: Model<MigrationDocument>,
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('Transaction') private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel('Expense') private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel('Receipt') private readonly receiptModel: Model<ReceiptDocument>,
    @InjectModel('Subscription') private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel('Report') private readonly reportModel: Model<ReportDocument>,
    @InjectModel('Merchant') private readonly merchantModel: Model<MerchantDocument>,
    @InjectModel('AIModel') private readonly aiModelModel: Model<AIModelDocument>,
    @InjectModel('OCR') private readonly ocrModel: Model<OCRDocument>,
    @InjectModel('Analytics') private readonly analyticsModel: Model<AnalyticsDocument>
  ) {}

  async runMigrations(): Promise<void> {
    try {
      const lastMigration = await this.migrationModel.findOne().sort({ version: -1 });
      const currentVersion = lastMigration?.version || 0;

      // Define migrations in order
      const migrations = [
        this.migrateToV1_0_0.bind(this),
        this.migrateToV1_1_0.bind(this),
        this.migrateToV2_0_0.bind(this),
        this.migrateToV2_1_0.bind(this),
      ];

      for (const migration of migrations) {
        const version = await migration();
        if (version > currentVersion) {
          await this.migrationModel.create({
            version,
            appliedAt: new Date(),
            status: 'matched',
          });
        }
      }

      this.logger.log('Migrations completed successfully');
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  private async migrateToV1_0_0(): Promise<number> {
    // Initial schema setup
    await Promise.all([
      this.userModel.createIndexes(),
      this.transactionModel.createIndexes(),
      this.expenseModel.createIndexes(),
      this.receiptModel.createIndexes(),
    ]);
    return 100;
  }

  private async migrateToV1_1_0(): Promise<number> {
    // Add subscription and report schemas
    await Promise.all([this.subscriptionModel.createIndexes(), this.reportModel.createIndexes()]);
    return 110;
  }

  private async migrateToV2_0_0(): Promise<number> {
    // Add merchant and AI model schemas
    await Promise.all([
      this.merchantModel.createIndexes(),
      this.aiModelModel.createIndexes(),
      this.ocrModel.createIndexes(),
    ]);
    return 200;
  }

  private async migrateToV2_1_0(): Promise<number> {
    // Add analytics and update existing schemas
    await Promise.all([this.analyticsModel.createIndexes(), this.updateExistingSchemas()]);
    return 210;
  }

  private async updateExistingSchemas(): Promise<void> {
    // Update existing documents with new fields
    const updates = [
      this.userModel.updateMany({}, { $set: { 'metadata.lastUpdated': new Date() } }),
      this.transactionModel.updateMany({}, { $set: { 'metadata.lastUpdated': new Date() } }),
      this.expenseModel.updateMany({}, { $set: { 'metadata.lastUpdated': new Date() } }),
      this.receiptModel.updateMany({}, { $set: { 'metadata.lastUpdated': new Date() } }),
    ];

    await Promise.all(updates);
  }

  async rollback(version: number): Promise<void> {
    try {
      const migrations = await this.migrationModel
        .find({ version: { $gt: version } })
        .sort({ version: -1 });

      for (const migration of migrations) {
        await this.rollbackMigration(migration.version);
        await this.migrationModel.deleteOne({ _id: migration._id });
      }

      this.logger.log(`Rollback to version ${version} completed successfully`);
    } catch (error) {
      this.logger.error('Rollback failed:', error);
      throw error;
    }
  }

  private async rollbackMigration(version: number): Promise<void> {
    // Implement rollback logic for each version
    switch (version) {
      case 210:
        await this.analyticsModel.deleteMany({});
        break;
      case 200:
        await this.merchantModel.deleteMany({});
        await this.aiModelModel.deleteMany({});
        await this.ocrModel.deleteMany({});
        break;
      case 110:
        await this.subscriptionModel.deleteMany({});
        await this.reportModel.deleteMany({});
        break;
      default:
        this.logger.warn(`No rollback defined for version ${version}`);
    }
  }
}
