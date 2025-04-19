import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MerchantLearningService } from './merchant-learning.service';
import { MerchantCategorizationService } from './merchant-categorization.service';
import { ITransactionRepository } from '@fresh-expense/types';

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
