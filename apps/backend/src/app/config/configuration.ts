import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  environment: process.env["NODE_ENV"] || "development",
  port: Number.parseInt(process.env.PORT ?? "3000", 10),
  host: process.env["HOST"] || "localhost",
  corsOrigin: (process.env.CORS_ORIGIN ?? "*") as string,
  frontendUrl: process.env["FRONTEND_URL"] || "http://localhost:3000",
  apiPrefix: (process.env.API_PREFIX ?? "api") as string,
}));

export const databaseConfig = registerAs("database", () => ({
  url: process.env["DATABASE_URL"] || "mongodb://localhost:27017/expense-tracker",
  name: process.env["MONGODB_DB"] || "expense-v2",
  uri: (process.env.MONGODB_URI ?? "mongodb://localhost:27017/fresh-expense") as string,
}));

export const authConfig = registerAs("auth", () => ({
  jwtSecret: (process.env.JWT_SECRET ?? "default-secret-key") as string,
  accessExpiration: process.env["JWT_ACCESS_EXPIRATION"] || "15m",
  refreshExpiration: process.env["JWT_REFRESH_EXPIRATION"] || "7d",
  encryptionKey: process.env["ENCRYPTION_KEY"],
  encryptionIv: process.env["ENCRYPTION_IV"],
  google: {
    clientId: process.env["GOOGLE_CLIENT_ID"],
    clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
    redirectUri: process.env["GOOGLE_REDIRECT_URI"],
  },
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? "1d") as string,
}));

export const storageConfig = registerAs("storage", () => ({
  r2: {
    accountId: process.env["R2_ACCOUNT_ID"],
    accessKeyId: process.env["R2_ACCESS_KEY_ID"],
    secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"],
    bucketName: process.env["R2_BUCKET_NAME"],
    publicUrl: process.env["R2_PUBLIC_URL"],
    region: process.env["R2_REGION"] || "auto",
    endpoint: process.env["R2_ENDPOINT"],
  },
  r2AccountId: (process.env.R2_ACCOUNT_ID ?? "") as string,
  r2AccessKeyId: (process.env.R2_ACCESS_KEY_ID ?? "") as string,
  r2SecretAccessKey: (process.env.R2_SECRET_ACCESS_KEY ?? "") as string,
  r2Bucket: (process.env.R2_BUCKET ?? "fresh-expense") as string,
}));

export const emailConfig = registerAs("email", () => ({
  smtp: {
    host: process.env["SMTP_HOST"] || "smtp.gmail.com",
    port: Number.parseInt(process.env["SMTP_PORT"] || "587", 10),
    user: process.env["SMTP_USER"],
    password: process.env["SMTP_PASSWORD"],
    from: process.env["SMTP_FROM"],
  },
  host: (process.env.EMAIL_HOST ?? "smtp.example.com") as string,
  port: Number.parseInt(process.env.EMAIL_PORT ?? "587", 10),
  user: (process.env.EMAIL_USER ?? "user@example.com") as string,
  pass: (process.env.EMAIL_PASS ?? "password") as string,
}));

export const tellerConfig = registerAs("teller", () => ({
  apiUrl: process.env["TELLER_API_URL"],
  appId: process.env["TELLER_APP_ID"],
  applicationId: process.env["TELLER_APPLICATION_ID"],
  apiVersion: process.env["TELLER_API_VERSION"],
  environment: (process.env.TELLER_ENVIRONMENT ?? "sandbox") as string,
  redirectUri: process.env["TELLER_REDIRECT_URI"],
  apiKey: (process.env.TELLER_API_KEY ?? "") as string,
}));

export const loggingConfig = registerAs("logging", () => ({
  level: (process.env.LOG_LEVEL ?? "info") as string,
  enableDebug: process.env["ENABLE_DEBUG_MODE"] === "true",
  format: (process.env.LOG_FORMAT ?? "json") as string,
}));

export const redisConfig = registerAs("redis", () => ({
  host: (process.env.REDIS_HOST ?? "localhost") as string,
  port: Number.parseInt(process.env.REDIS_PORT ?? "6379", 10),
  password: (process.env.REDIS_PASSWORD ?? "") as string,
  db: Number.parseInt(process.env.REDIS_DB ?? "0", 10),
}));
