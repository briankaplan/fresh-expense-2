export interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number;
}

export class RateLimits {
  private limits: Map<string, { maxRequests: number; timeWindow: number; requests: number[] }>;

  constructor(limits: Record<string, RateLimitConfig>) {
    this.limits = new Map();
    for (const [key, value] of Object.entries(limits)) {
      this.limits.set(key, {
        ...value,
        requests: [],
      });
    }
  }

  async checkLimit(key: string): Promise<boolean> {
    const limit = this.limits.get(key);
    if (!limit) {
      return true;
    }

    const now = Date.now();
    const { maxRequests, timeWindow, requests } = limit;

    // Remove old requests
    const cutoff = now - timeWindow;
    const validRequests = requests.filter((time) => time > cutoff);

    // Check if we're under the limit
    if (validRequests.length >= maxRequests) {
      return false;
    }

    // Add new request
    validRequests.push(now);
    this.limits.set(key, { ...limit, requests: validRequests });

    return true;
  }

  async waitForLimit(key: string): Promise<void> {
    while (!(await this.checkLimit(key))) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
} 