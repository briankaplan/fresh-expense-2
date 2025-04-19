import { ITransactionRepository } from "@fresh-expense/types";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MerchantCategorizationService } from "./merchant-categorization.service";
import { MerchantLearningService } from "./merchant-learning.service";

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600, // 1 hour
      max: 1000, // maximum number of items in cache
    }),
  ],
  providers: [
    MerchantLearningService,
    MerchantCategorizationService,
    {
      provide: ITransactionRepository,
      useClass: ITransactionRepository, // This should be replaced with actual implementation
    },
  ],
  exports: [MerchantLearningService, MerchantCategorizationService],
})
export class MerchantModule {}
