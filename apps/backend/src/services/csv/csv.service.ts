import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TransactionDocument } from '../../schemas/transaction.schema';

export class CsvService {
  constructor(
    @InjectModel('Transaction') private transactionModel: Model<TransactionDocument>,
  ) {}
} 