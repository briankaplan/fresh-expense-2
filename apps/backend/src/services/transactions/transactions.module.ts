import { Module } from "@nestjs/common";

import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";

import { MongoDBModule } from "@/core/database/mongodb.module";

export class TransactionsModule {}
