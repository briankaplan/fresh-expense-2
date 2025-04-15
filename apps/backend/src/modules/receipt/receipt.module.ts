import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Receipt, ReceiptSchema } from '@schemas/receipt.schema';
import { ReceiptService } from './services/receipt.service';
import { ReceiptStorageService } from './services/receipt-storage.service';
import { ReceiptProcessorService } from './services/receipt-processor.service';
import { ReceiptMatcherService } from './services/receipt-matcher.service';
import { R2Module } from '@services/r2/r2.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Receipt.name, schema: ReceiptSchema }]), R2Module],
  providers: [
    ReceiptService,
    ReceiptStorageService,
    ReceiptProcessorService,
    ReceiptMatcherService,
  ],
  exports: [ReceiptService],
})
export class ReceiptModule {}
