import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Receipt, ReceiptSchema } from '@fresh-expense/types';
import { R2Service } from '../../../services/r2/r2.service';
import { OCRService } from '../../../services/ocr/ocr.service';
import { ReceiptBankService } from './receipt-bank.service';
import { UnifiedReceiptService } from './unified-receipt.service';
import { MerchantLearningService } from '../merchant/merchant-learning.service';
import { UnifiedReceiptProcessorService } from '../unified-receipt-processor.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Receipt', schema: ReceiptSchema }])],
  providers: [
    R2Service,
    OCRService,
    ReceiptBankService,
    UnifiedReceiptService,
    MerchantLearningService,
    UnifiedReceiptProcessorService,
  ],
  exports: [UnifiedReceiptService],
})
export class ReceiptModule {}
