declare module "cache-manager-ioredis" {
  import { type Store, Cache } from "cache-manager";
  import type { Redis } from "ioredis";

  interface RedisStore extends Store {
    getClient(): Redis;
    keys(pattern?: string): Promise<string[]>;
    isCacheableValue(value: any): boolean;
  }

  interface RedisStoreConfig {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    ttl?: number;
    max?: number;
    keyPrefix?: string;
    retryStrategy?: (times: number) => number | null;
  }

  function redisStore(config?: RedisStoreConfig): RedisStore;
  export default redisStore;
}
