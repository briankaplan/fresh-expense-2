import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { GoogleController } from "./google.controller";
import { GoogleService } from "./services/google.service";
import { TokenManagerService } from "./services/token-manager.service";

export class GoogleModule {}
