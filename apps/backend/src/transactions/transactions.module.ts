import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TransactionSchema } from '../schemas/transaction.schema';
import { Metrics, MetricsSchema } from '../schemas/metrics.schema';
import { ReceiptSchema } from '../schemas/receipt.schema';
import { Notification, NotificationSchema } from '../schemas/notification.schema';
import { Transaction, Receipt } from '@fresh-expense/types';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Metrics', schema: MetricsSchema },
      { name: 'Receipt', schema: ReceiptSchema },
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
