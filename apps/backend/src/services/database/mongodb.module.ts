import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { MongoDBHealthIndicator } from './mongodb.health';
import { MongoDBService } from './mongodb.service';
import { BudgetRepository } from './repositories/budget.repository';
import { CategoryRepository } from './repositories/category.repository';
import { MerchantRepository } from './repositories/merchant.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { ReceiptRepository } from './repositories/receipt.repository';
import { ReportRepository } from './repositories/report.repository';
import { SettingsRepository } from './repositories/settings.repository';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { UserRepository } from './repositories/user.repository';


export class MongoDBModule {}
