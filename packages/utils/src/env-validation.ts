import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_GOOGLE_CLIENT_ID: z.string().min(1),
  VITE_GOOGLE_CLIENT_SECRET: z.string().min(1),
  VITE_GOOGLE_REDIRECT_URI: z.string().url(),
  VITE_R2_PUBLIC_URL: z.string().url(),
  VITE_HUGGINGFACE_API_KEY: z.string().min(1),
  VITE_TELLER_APPLICATION_ID: z.string().min(1),
  VITE_TELLER_ENVIRONMENT: z.enum(["sandbox", "production"]),
  VITE_TELLER_WEBHOOK_URL: z.string().url(),
  VITE_TELLER_SIGNING_SECRET: z.string().min(1),
  VITE_TELLER_SIGNING_KEY: z.string().min(1),
  VITE_TELLER_API_KEY: z.string().min(1),
  VITE_SENDGRID_API_KEY: z.string().min(1),
  VITE_EMAIL_FROM: z.string().email(),
  VITE_GRAFANA_USER: z.string().min(1),
  VITE_GRAFANA_PASSWORD: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, string>): Env {
  return envSchema.parse(env);
}

export function getEnv(): Env {
  return validateEnv(process.env as Record<string, string>);
}
