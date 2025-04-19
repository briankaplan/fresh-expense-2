import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import type { ReceiptDocument } from "../../schemas/receipt.schema";

export class ReceiptMatcherService {
  constructor(@InjectModel("Receipt") private receiptModel: Model<ReceiptDocument>) {}
}
