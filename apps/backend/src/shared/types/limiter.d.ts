declare module "limiter" {
  interface RateLimiterOptions {
    tokensPerInterval: number;
    interval: string;
  }

  export class RateLimiter {
    constructor(options: RateLimiterOptions);
    removeTokens(count: number): Promise<number>;
  }
}
