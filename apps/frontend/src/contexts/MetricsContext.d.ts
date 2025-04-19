import React from 'react';
import { Metrics, MetricsQueryParams, MetricsSummary } from '@fresh-expense/types';
interface MetricsContextType {
    metrics: Metrics[];
    aggregatedData: MetricsSummary | null;
    loading: boolean;
    error: string | null;
    fetchMetrics: (params: MetricsQueryParams) => Promise<void>;
    fetchAggregatedMetrics: (params: MetricsQueryParams) => Promise<void>;
    createMetric: (metric: Partial<Metrics>) => Promise<void>;
    updateMetric: (id: string, metric: Partial<Metrics>) => Promise<void>;
    deleteMetric: (id: string) => Promise<void>;
}
export declare const MetricsProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useMetrics: () => MetricsContextType;
export {};
//# sourceMappingURL=MetricsContext.d.ts.map