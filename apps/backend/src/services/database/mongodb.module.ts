import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { MongoDBService } from './mongodb.service';
import { MongoDBHealthIndicator } from './mongodb.health';
import { UserRepository } from './repositories/user.repository';
import { MerchantRepository } from './repositories/merchant.repository';
import { ReceiptRepository } from './repositories/receipt.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { ReportRepository } from './repositories/report.repository';
import { CategoryRepository } from './repositories/category.repository';
import { BudgetRepository } from './repositories/budget.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { SettingsRepository } from './repositories/settings.repository';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [
    MongoDBService,
    MongoDBHealthIndicator,
    UserRepository,
    MerchantRepository,
    ReceiptRepository,
    TransactionRepository,
    SubscriptionRepository,
    ReportRepository,
    CategoryRepository,
    BudgetRepository,
    NotificationRepository,
    SettingsRepository,
  ],
  exports: [
    MongoDBService,
    MongoDBHealthIndicator,
    UserRepository,
    MerchantRepository,
    ReceiptRepository,
    TransactionRepository,
    SubscriptionRepository,
    ReportRepository,
    CategoryRepository,
    BudgetRepository,
    NotificationRepository,
    SettingsRepository,
  ],
})
export class MongoDBModule {} 