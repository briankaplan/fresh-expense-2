import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiCategorizationService } from './ai-categorization.service';

@Module({
  imports: [ConfigModule],
  providers: [AiCategorizationService],
  exports: [AiCategorizationService]
})
export class AiModule {} 