export interface TellerApiConfig {
  applicationId: string;
  environment: "sandbox" | "development" | "production";
  cert?: string;
  key?: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface TellerApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface TellerApiResponse<T> {
  data: T;
  error?: TellerApiError;
}

export interface TellerPagination {
  cursor?: string;
  limit?: number;
  hasMore: boolean;
}

export interface TellerApiOptions {
  pagination?: {
    limit?: number;
    cursor?: string;
  };
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
}
