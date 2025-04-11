import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  environment: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '3001', 10),
  host: process.env['HOST'] || 'localhost',
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3001',
  frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:3000',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env['DATABASE_URL'] || 'mongodb://localhost:27017/expense-tracker',
  name: process.env['MONGODB_DB'] || 'expense-v2',
}));

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env['JWT_SECRET'],
  accessExpiration: process.env['JWT_ACCESS_EXPIRATION'] || '15m',
  refreshExpiration: process.env['JWT_REFRESH_EXPIRATION'] || '7d',
  encryptionKey: process.env['ENCRYPTION_KEY'],
  encryptionIv: process.env['ENCRYPTION_IV'],
  google: {
    clientId: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    redirectUri: process.env['GOOGLE_REDIRECT_URI'],
  },
}));

export const storageConfig = registerAs('storage', () => ({
  r2: {
    accountId: process.env['R2_ACCOUNT_ID'],
    accessKeyId: process.env['R2_ACCESS_KEY_ID'],
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'],
    bucketName: process.env['R2_BUCKET_NAME'],
    publicUrl: process.env['R2_PUBLIC_URL'],
    region: process.env['R2_REGION'] || 'auto',
    endpoint: process.env['R2_ENDPOINT'],
  },
}));

export const emailConfig = registerAs('email', () => ({
  smtp: {
    host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] || '587', 10),
    user: process.env['SMTP_USER'],
    password: process.env['SMTP_PASSWORD'],
    from: process.env['SMTP_FROM'],
  },
}));

export const tellerConfig = registerAs('teller', () => ({
  apiUrl: process.env['TELLER_API_URL'],
  appId: process.env['TELLER_APP_ID'],
  applicationId: process.env['TELLER_APPLICATION_ID'],
  apiVersion: process.env['TELLER_API_VERSION'],
  environment: process.env['TELLER_ENVIRONMENT'],
  redirectUri: process.env['TELLER_REDIRECT_URI'],
}));

export const loggingConfig = registerAs('logging', () => ({
  level: process.env['LOG_LEVEL'] || 'debug',
  enableDebug: process.env['ENABLE_DEBUG_MODE'] === 'true',
}));
