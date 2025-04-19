export interface ServiceConfig {
  enabled: boolean;
  timeout: number;
  retries?: number;
  backoff?: {
    initial: number;
    factor: number;
    maxDelay: number;
  };
}

export enum ServiceType {
  CORE = 'core',
  UTILITY = 'utility',
  INTEGRATION = 'integration',
  WORKER = 'worker',
  API = 'api'
}

export interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  latency: number;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  message?: string;
  metrics?: ServiceMetrics;
}

export interface ServiceDependency {
  name: string;
  type: ServiceType;
  required: boolean;
  config?: ServiceConfig;
  health?: ServiceHealth;
}

export interface ServiceContext {
  requestId: string;
  userId?: string;
  companyId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
