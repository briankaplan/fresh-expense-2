import { MetricType } from './metrics.enum';

export interface BaseMetric {
  id: string;
  timestamp: Date;
  value: number;
  name: string;
  labels?: Record<string, string>;
}

export interface MetricMetadata {
  source?: string;
  unit?: string;
  description?: string;
  [key: string]: any;
}

export interface Metric extends BaseMetric {
  userId?: string;
  companyId?: string;
  type: MetricType;
  metadata?: MetricMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricQuery {
  startDate: Date;
  endDate: Date;
  type?: MetricType;
  name?: string;
  labels?: Record<string, string>;
}

export { MetricType };

// Re-export existing types with explicit naming
export { 
  MetricsData,
  MetricsSummary,
  MetricsTrend,
  MetricsDocument
} from '../metrics.types';
