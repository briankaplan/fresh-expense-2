import { Module } from '@nestjs/common';

import { AppRedisModule } from '../../app/redis/redis.module';

import { CacheService } from './cache.service';


export class CacheModule {}
