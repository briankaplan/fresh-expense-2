import { Receipt } from '@fresh-expense/types';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceiptSchema } from '@schemas/receipt.schema';
import { R2Module } from '@services/r2/r2.module';

import { ReceiptMatcherService } from './services/receipt-matcher.service';
import { ReceiptProcessorService } from './services/receipt-processor.service';
import { ReceiptStorageService } from './services/receipt-storage.service';
import { ReceiptService } from './services/receipt.service';



export class ReceiptModule {}
