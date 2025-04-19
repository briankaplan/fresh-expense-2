import { BaseDocument } from './schemas/base.schema';

/**
 * Interface representing a metrics record
 */
export interface Metrics extends BaseDocument {
  /**
   * The user ID associated with the metrics
   */
  userId: string;

  /**
   * The type of metric being recorded
   */
  metricType: string;

  /**
   * The numeric value of the metric
   */
  value: number;

  /**
   * Additional metadata for the metric
   */
  metadata?: Record<string, any>;

  /**
   * Timestamp when the metric was recorded
   */
  timestamp: Date;
}

/**
 * Type for metric types that can be recorded
 */
export type MetricType =
  | 'spending'
  | 'income'
  | 'savings'
  | 'budget'
  | 'category'
  | 'merchant'
  | 'recurring'
  | 'split';

/**
 * Interface for metrics metadata
 */
export interface MetricsMetadata {
  /**
   * Category of the metric (if applicable)
   */
  category?: string;

  /**
   * Period the metric covers (e.g., '2024-01', '2024-Q1')
   */
  period?: string;

  /**
   * Merchant associated with the metric (if applicable)
   */
  merchant?: string;

  /**
   * Additional custom metadata
   */
  [key: string]: any;
}

/**
 * Interface for metrics query parameters
 */
export interface MetricsQueryParams {
  /**
   * User ID to filter metrics by
   */
  userId: string;

  /**
   * Type of metrics to retrieve
   */
  metricType?: MetricType;

  /**
   * Start date for the metrics period
   */
  startDate?: Date;

  /**
   * End date for the metrics period
   */
  endDate?: Date;

  /**
   * Category to filter metrics by
   */
  category?: string;

  /**
   * Merchant to filter metrics by
   */
  merchant?: string;
}

/**
 * Interface for metrics aggregation results
 */
export interface MetricsAggregation {
  /**
   * Total value of the metrics
   */
  total: number;

  /**
   * Average value of the metrics
   */
  average: number;

  /**
   * Minimum value in the metrics set
   */
  min: number;

  /**
   * Maximum value in the metrics set
   */
  max: number;

  /**
   * Number of records in the metrics set
   */
  count: number;

  /**
   * Breakdown of metrics by category
   */
  byCategory?: Record<string, number>;

  /**
   * Breakdown of metrics by merchant
   */
  byMerchant?: Record<string, number>;

  /**
   * Breakdown of metrics by period
   */
  byPeriod?: Record<string, number>;
}
