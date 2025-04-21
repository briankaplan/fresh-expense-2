import { Receipt } from "@fresh-expense/types";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ReceiptFinderService } from "./receipt-finder.service";
import { ReceiptSchema } from "../../app/receipts/schemas/receipt.schema";
import { CacheModule } from "../cache/cache.module";
import { R2Module } from "../r2/r2.module";


export class ReceiptFinderModule {}
