import { Logger, type MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./app/auth/auth.module";
import { ExpensesModule } from "./app/expenses/expenses.module";
import { MerchantsModule } from "./app/merchants/merchants.module";
import { ReportsModule } from "./app/reports/reports.module";
import { SubscriptionsModule } from "./app/subscriptions/subscriptions.module";
import { UsersModule } from "./app/users/users.module";
import { DashboardController } from "./controllers/dashboard.controller";
import { MetricsModule } from "./metrics/metrics.module";
import { ValidateRequestMiddleware } from "./middleware/validate-request.middleware";
import { NotificationModule } from "./services/notification/notification.module";
import { OCRService } from "./services/ocr/ocr.service";
import { R2Service } from "./services/r2/r2.service";
import { ReceiptService } from "./services/receipt/receipt.service";
import { TellerService } from "./services/teller/teller.service";

/**
 * Root module of the Fresh Expense backend application
 * Configures global modules, middleware, and application-wide settings
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger("MongooseModule");
        const uri =
          configService.get<string>("MONGODB_URI") || "mongodb://localhost:27017/fresh-expense";

        try {
          logger.log(`Connecting to MongoDB at ${uri}`);
          return {
            uri,
            retryAttempts: 3,
            retryDelay: 1000,
          };
        } catch (error) {
          logger.error(
            "Failed to connect to MongoDB",
            error instanceof Error ? error.stack : undefined,
          );
          throw error;
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ExpensesModule,
    MerchantsModule,
    ReportsModule,
    SubscriptionsModule,
    NotificationModule,
    MetricsModule,
  ],
  controllers: [DashboardController],
  providers: [TellerService, ReceiptService, R2Service, OCRService],
})
export class AppModule implements NestModule {
  /**
   * Configures middleware for the application
   * @param consumer - The middleware consumer
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ValidateRequestMiddleware).forRoutes("*"); // Apply to all routes
  }
}
