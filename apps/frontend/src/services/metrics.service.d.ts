import { Metrics, MetricsQueryParams, MetricsAggregation } from '@fresh-expense/types';
declare class MetricsService {
    private readonly baseUrl;
    findAll(params: MetricsQueryParams): Promise<Metrics[]>;
    findByType(type: string, params: MetricsQueryParams): Promise<Metrics[]>;
    findOne(id: string): Promise<Metrics>;
    create(metric: Partial<Metrics>): Promise<Metrics>;
    update(id: string, metric: Partial<Metrics>): Promise<Metrics>;
    delete(id: string): Promise<void>;
    aggregateMetrics(params: MetricsQueryParams): Promise<MetricsAggregation>;
}
export declare const metricsService: MetricsService;
export {};
//# sourceMappingURL=metrics.service.d.ts.map