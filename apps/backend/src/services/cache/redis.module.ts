import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisModule as NestRedisModule } from "@nestjs/redis";

import { RedisService } from "./redis.service";

export class RedisModule {}
