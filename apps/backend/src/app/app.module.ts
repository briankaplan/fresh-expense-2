import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { AuthModule } from "./auth/auth.module";
import {
  appConfig,
  authConfig,
  databaseConfig,
  emailConfig,
  loggingConfig,
  redisConfig,
  storageConfig,
  tellerConfig,
} from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { AppRedisModule } from "./redis/redis.module";
import { UsersModule } from "./users/users.module";
import { DashboardController } from "../controllers/dashboard.controller";
import { CacheModule } from "../services/cache/cache.module";
import { OCRService } from "../services/ocr/ocr.service";
import { R2Service } from "../services/r2/r2.service";
import { ReceiptService } from "../services/receipt/receipt.service";
import { TellerService } from "../services/teller/teller.service";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        databaseConfig,
        emailConfig,
        loggingConfig,
        redisConfig,
        storageConfig,
        tellerConfig,
      ],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    AppRedisModule,
    CacheModule,
  ],
  controllers: [DashboardController],
  providers: [OCRService, R2Service, ReceiptService, TellerService],
})
export class AppModule { }
