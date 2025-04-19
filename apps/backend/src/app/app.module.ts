import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { DashboardController } from '../controllers/dashboard.controller';
import { CacheModule } from '../services/cache/cache.module';
import { OCRService } from '../services/ocr/ocr.service';
import { R2Service } from '../services/r2/r2.service';
import { ReceiptService } from '../services/receipt/receipt.service';
import { TellerService } from '../services/teller/teller.service';

import { AuthModule } from './auth/auth.module';
import {
  appConfig,
  databaseConfig,
  authConfig,
  emailConfig,
  storageConfig,
  tellerConfig,
  loggingConfig,
  redisConfig,
} from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AppRedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';


export class AppModule {}
