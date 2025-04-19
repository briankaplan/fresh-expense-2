import { MetricType } from './metrics.enum';

export interface MetricsQueryParams {
  userId: string;
  metricType?: MetricType;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  merchant?: string;
}

export interface MetricsAggregation {
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
}

export interface MetricsTrend {
  current: number;
  previous: number;
  change: number;
  percentage: number;
}
