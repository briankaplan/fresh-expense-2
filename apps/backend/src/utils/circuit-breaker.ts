export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
}

export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private isOpen: boolean = false;

  constructor(private readonly options: CircuitBreakerOptions) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.isOpen = false;
        this.failures = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.options.failureThreshold) {
        this.isOpen = true;
      }

      throw error;
    }
  }

  getState(): {
    isOpen: boolean;
    failures: number;
    lastFailureTime: number;
  } {
    return {
      isOpen: this.isOpen,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset(): void {
    this.isOpen = false;
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}
