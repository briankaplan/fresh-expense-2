import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TellerService } from '../services/teller/teller.service';
import { ReceiptService } from '../services/receipt/receipt.service';
import { R2Service } from '../services/r2/r2.service';
import { OCRService } from '../services/ocr/ocr.service';
import { DashboardController } from '../controllers/dashboard.controller';
import { DatabaseModule } from './database/database.module';
import { appConfig, databaseConfig, authConfig, emailConfig, storageConfig, tellerConfig, loggingConfig } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        emailConfig,
        storageConfig,
        tellerConfig,
        loggingConfig,
      ],
    }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [TellerService, ReceiptService, R2Service, OCRService],
})
export class AppModule {}
