import { Merchant, Receipt, Transaction } from "@fresh-expense/types";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { TransactionSchema } from "../../schemas/transaction.schema";
import { MerchantSchema } from "../schemas/merchant.schema";

import { Expense, ExpenseSchema } from "@/modules/expenses/schemas/expense.schema";
import { ReceiptSchema } from "@/modules/receipts/schemas/receipt.schema";

export class DatabaseModule {}
