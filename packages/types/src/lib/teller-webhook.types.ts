export interface TellerWebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature: string;
}

export interface TellerWebhookConfig {
  url: string;
  secret: string;
  enabled: boolean;
  events: string[];
}

export interface TellerWebhookDelivery {
  id: string;
  eventId: string;
  timestamp: string;
  status: 'success' | 'failed';
  statusCode?: number;
  error?: string;
  retries: number;
  nextRetry?: string;
}
