import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ReceiptDocument } from '../../schemas/receipt.schema';

export class ReceiptMatcherService {
  constructor(
    @InjectModel('Receipt') private receiptModel: Model<ReceiptDocument>,
  ) {}
} 