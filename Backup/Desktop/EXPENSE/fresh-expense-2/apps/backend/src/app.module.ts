import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';
import { TellerService } from './services/teller/teller.service';
import { ReceiptService } from './services/receipt/receipt.service';
import { R2Service } from './services/r2/r2.service';
import { OCRService } from './services/ocr/ocr.service';
import { DashboardController } from './controllers/dashboard.controller';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Receipt, ReceiptSchema } from './app/receipts/schemas/receipt.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Receipt.name, schema: ReceiptSchema },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [TellerService, ReceiptService, R2Service, OCRService],
})
export class AppModule {} 