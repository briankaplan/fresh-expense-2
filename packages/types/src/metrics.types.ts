import type { Document } from "mongoose";

import type { MetricType } from "./metrics/metrics.enum";

export interface Metrics {
  id: string;
  userId: string;
  type: MetricType;
  value: number;
  timestamp: Date;
  metadata?: {
    category?: string;
    description?: string;
    [key: string]: any;
  };
}

export interface MetricsQueryParams {
  userId: string;
  startDate?: string;
  endDate?: string;
  type?: MetricType;
}

export interface MetricsAggregation {
  total: number;
  average: number;
  count: number;
  min: number;
  max: number;
}

export interface MetricsTrend {
  period: string;
  value: number;
  change: number;
}

export interface MetricsData {
  date: Date;
  value: number;
  type: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MetricsSummary {
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
  byTag?: Record<string, number>;
  trend?: {
    direction: "up" | "down" | "stable";
    change: number;
    changePercent: number;
  };
}

export type MetricsDocument = Metrics & Document;
