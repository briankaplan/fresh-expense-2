import { Module } from "@nestjs/common";

import { ExpenseIntegrationService } from "./expense-integration.service";
import { MongoDBModule } from "@/core/database/mongodb.module";

@Module({
    imports: [MongoDBModule],
    providers: [ExpenseIntegrationService],
    exports: [ExpenseIntegrationService]
})
export class ExpenseIntegrationModule { }
