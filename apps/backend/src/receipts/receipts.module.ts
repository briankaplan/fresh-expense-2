import { Receipt, Transaction } from '@fresh-expense/types';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { R2Module } from '../storage/r2.module';
import { TransactionSchema } from '../transactions/schemas/transaction.schema';
import { WorkersModule } from '../workers/workers.module';

import { ReceiptProcessorService } from './receipt-processor.service';
import { ReceiptsController } from './receipts.controller';
import { ReceiptSchema } from './schemas/receipt.schema';



export class ReceiptsModule {}
