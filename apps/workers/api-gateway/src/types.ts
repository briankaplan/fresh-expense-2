export interface Env {
  JWT_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  MONGODB_URI: string;
  TELLER_API_KEY: string;
  TELLER_ENV: string;
  CACHE: KVNamespace;
  FILES: R2Bucket;
  USERS: KVNamespace;
  // Add other environment variables as needed
  // For example:
  // API_KEY: string;
  // AUTH_TOKEN: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
}

export interface CustomRequest extends Request {
  env: Env;
  user?: AuthContext;
}

// Cloudflare Workers types
declare global {
  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
  }

  interface KVNamespace {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
  }

  interface R2Bucket {
    get(key: string): Promise<R2Object | null>;
    put(key: string, value: string | ReadableStream | ArrayBuffer): Promise<void>;
    delete(key: string): Promise<void>;
  }

  interface R2Object {
    key: string;
    size: number;
    uploaded: Date;
    httpMetadata: {
      contentType?: string;
      contentLanguage?: string;
      contentDisposition?: string;
      contentEncoding?: string;
      cacheControl?: string;
      cacheExpiry?: Date;
    };
  }
}
