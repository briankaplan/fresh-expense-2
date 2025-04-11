import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';
import { ExpensesModule } from './app/expenses/expenses.module';
import { MerchantsModule } from './app/merchants/merchants.module';
import { ReportsModule } from './app/reports/reports.module';
import { SubscriptionsModule } from './app/subscriptions/subscriptions.module';
import { TellerService } from './services/teller/teller.service';
import { ReceiptService } from './services/receipt/receipt.service';
import { R2Service } from './services/r2/r2.service';
import { OCRService } from './services/ocr/ocr.service';
import { DashboardController } from './controllers/dashboard.controller';
import { ValidateRequestMiddleware } from './middleware/validateRequest';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ExpensesModule,
    MerchantsModule,
    ReportsModule,
    SubscriptionsModule,
  ],
  controllers: [DashboardController],
  providers: [TellerService, ReceiptService, R2Service, OCRService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateRequestMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
} 