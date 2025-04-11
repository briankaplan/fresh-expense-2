import { Module } from '@nestjs/common';
import { ReceiptConverterService } from './receipt-converter.service';

@Module({
  providers: [ReceiptConverterService],
  exports: [ReceiptConverterService],
})
export class ReceiptConverterModule {} 