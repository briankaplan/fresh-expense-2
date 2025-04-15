import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MemoryBankService } from '../memory-bank.service';

@Module({
  imports: [ConfigModule],
  providers: [MemoryBankService],
  exports: [MemoryBankService],
})
export class MemoryBankModule {}
