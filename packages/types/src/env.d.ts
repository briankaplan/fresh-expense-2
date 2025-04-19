/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_GOOGLE_REDIRECT_URI: string;
  readonly VITE_R2_PUBLIC_URL: string;
  readonly VITE_HUGGINGFACE_API_KEY: string;
  readonly VITE_TELLER_APPLICATION_ID: string;
  readonly VITE_TELLER_ENVIRONMENT: string;
  readonly VITE_TELLER_WEBHOOK_URL: string;
  readonly VITE_TELLER_SIGNING_SECRET: string;
  readonly VITE_TELLER_SIGNING_KEY: string;
  readonly VITE_TELLER_API_KEY: string;
  readonly VITE_SENDGRID_API_KEY: string;
  readonly VITE_EMAIL_FROM: string;
  readonly VITE_GRAFANA_USER: string;
  readonly VITE_GRAFANA_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
