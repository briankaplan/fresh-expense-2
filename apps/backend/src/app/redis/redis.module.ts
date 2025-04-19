import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import redisStore from "cache-manager-ioredis";

export class AppRedisModule {}
