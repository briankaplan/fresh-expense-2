import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Receipt, ReceiptSchema } from '../../app/receipts/schemas/receipt.schema';
import { ReceiptFinderService } from './receipt-finder.service';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Receipt.name, schema: ReceiptSchema }]), R2Module],
  providers: [ReceiptFinderService],
  exports: [ReceiptFinderService],
})
export class ReceiptFinderModule {}
