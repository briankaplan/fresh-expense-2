import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from '../../schemas/transaction.schema';
import { Receipt, ReceiptSchema } from '../receipts/schemas/receipt.schema';
import { Merchant, MerchantSchema } from '../schemas/merchant.schema';
import { Expense, ExpenseSchema } from '../expenses/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
        dbName: configService.get<string>('database.name'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Receipt.name, schema: ReceiptSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
