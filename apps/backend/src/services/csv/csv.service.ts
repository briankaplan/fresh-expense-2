import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";

import type { TransactionDocument } from "../../schemas/transaction.schema";

export class CsvService {
  constructor(
    @InjectModel("Transaction")
    private transactionModel: Model<TransactionDocument>,
  ) {}
}
