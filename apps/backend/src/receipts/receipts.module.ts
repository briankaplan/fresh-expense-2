import { Receipt, Transaction } from "@fresh-expense/types";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ReceiptProcessorService } from "./receipt-processor.service";
import { ReceiptsController } from "./receipts.controller";
import { ReceiptSchema } from "./schemas/receipt.schema";
import { R2Module } from "../storage/r2.module";
import { TransactionSchema } from "../transactions/schemas/transaction.schema";
import { WorkersModule } from "../workers/workers.module";


export class ReceiptsModule {}
