declare module 'ts-retry-promise' {
  interface RetryOptions {
    retries: number;
    delay: number;
    backoff: 'LINEAR' | 'EXPONENTIAL';
  }

  export function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
  ): Promise<T>;
} 