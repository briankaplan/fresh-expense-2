import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),
  R2_PUBLIC_URL: z.string(),
  R2_ENDPOINT: z.string(),
  R2_JURISDICTION: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().default("https://api.tallyup.com/auth/google/callback"),
  GOOGLE_PHOTOS_REDIRECT_URI: z
    .string()
    .default("https://api.tallyup.com/auth/google-photos/callback"),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM: z.string(),
  TALLYUP_APPLICATION_ID: z.string(),
  TALLYUP_API_URL: z.string().default("https://api.tallyup.com"),
  TALLYUP_API_VERSION: z.string().default("v1"),
  TALLYUP_ENVIRONMENT: z.enum(["development", "production"]).default("development"),
  TALLYUP_WEBHOOK_URL: z.string().default("https://api.tallyup.com/webhooks/tallyup"),
  TALLYUP_SIGNING_SECRET: z.string(),
  TALLYUP_SIGNING_KEY: z.string(),
});

export const environment = environmentSchema.parse(process.env);
