import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_BUCKET_NAME: z.string().min(1),
  MINDEE_API_KEY: z.string().min(1),
  CLOUDFLARE_AI_TOKEN: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url()
})

export const config = envSchema.parse(process.env) 