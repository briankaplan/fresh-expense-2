import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { UserContextService } from "./user-context.service";

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600, // 1 hour
      max: 1000, // maximum number of items in cache
    }),
  ],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class AuthModule {}
