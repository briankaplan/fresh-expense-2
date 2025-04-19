import { Receipt, Transaction } from "@fresh-expense/types";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Metrics, MetricsSchema } from "../schemas/metrics.schema";
import { Notification, NotificationSchema } from "../schemas/notification.schema";
import { ReceiptSchema } from "../schemas/receipt.schema";
import { TransactionSchema } from "../schemas/transaction.schema";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Transaction", schema: TransactionSchema },
      { name: "Metrics", schema: MetricsSchema },
      { name: "Receipt", schema: ReceiptSchema },
      { name: "Notification", schema: NotificationSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
