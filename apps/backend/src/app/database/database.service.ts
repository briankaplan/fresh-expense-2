import { Injectable, type OnModuleInit } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { Mongoose } from "mongoose";

@Injectable()
export class DatabaseService implements OnModuleInit {
  private mongoose: Mongoose;

  constructor(private configService: ConfigService) {
    this.mongoose = new Mongoose();
  }

  async onModuleInit() {
    const uri = this.configService.get<string>("database.uri");
    if (!uri) {
      throw new Error("Database URI is not configured");
    }
    await this.mongoose.connect(uri);
  }

  async onModuleDestroy() {
    await this.mongoose.disconnect();
  }
}
