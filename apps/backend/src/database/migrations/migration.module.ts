import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { MigrationService } from "./migration.service";
import { Migration, MigrationSchema } from "./schemas/migration.schema";

export class MigrationModule {}
