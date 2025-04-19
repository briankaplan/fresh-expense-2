import { Merchant } from "@fresh-expense/types";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { MerchantsController } from "./merchants.controller";
import { MerchantsService } from "./merchants.service";
import { MerchantSchema } from "./schemas/merchant.schema";

export class MerchantsModule {}
