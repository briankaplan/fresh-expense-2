'use client';

import { BaseService } from '../db/baseService';

interface MetricPoint {
  timestamp: Date;
  value: number;
  labels?: Record<string, string>;
}

interface MetricQuery {
  name: string;
  startTime?: Date;
  endTime?: Date;
  labels?: Record<string, string>;
}

export class MetricsService extends BaseService {
  async recordMetric(
    name: string,
    value: number,
    labels?: Record<string, string>
  ): Promise<void> {
    await this.executeWithRetry(
      async () => {
        await this.db.metric.create({
          data: {
            name,
            value,
            labels,
            timestamp: new Date()
          }
        });
      },
      {
        errorCode: 'METRIC_RECORD_FAILED',
        errorMessage: 'Failed to record metric',
        context: { name, value, labels }
      }
    );
  }

  async queryMetrics(query: MetricQuery): Promise<MetricPoint[]> {
    return this.executeWithRetry(
      async () => {
        const metrics = await this.db.metric.findMany({
          where: {
            name: query.name,
            ...(query.startTime && { timestamp: { gte: query.startTime } }),
            ...(query.endTime && { timestamp: { lte: query.endTime } }),
            ...(query.labels && { labels: query.labels })
          },
          orderBy: { timestamp: 'asc' }
        });

        return metrics.map(m => ({
          timestamp: m.timestamp,
          value: m.value,
          labels: m.labels
        }));
      },
      {
        errorCode: 'METRIC_QUERY_FAILED',
        errorMessage: 'Failed to query metrics',
        context: query
      }
    );
  }
} 