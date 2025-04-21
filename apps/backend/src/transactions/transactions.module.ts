import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { Metrics, MetricsSchema } from "../schemas/metrics.schema";
import { Notification, NotificationSchema } from "../schemas/notification.schema";
import { Receipt, ReceiptSchema } from "../schemas/receipt.schema";
import { Transaction, TransactionSchema } from "../schemas/transaction.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Metrics.name, schema: MetricsSchema },
      { name: Receipt.name, schema: ReceiptSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }
