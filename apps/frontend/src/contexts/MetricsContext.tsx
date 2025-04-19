import React, { createContext, useContext, useState, useCallback } from 'react';
import { Metrics, MetricsQueryParams, MetricsSummary } from '@fresh-expense/types';
import { metricsService } from '../services/metrics.service';

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

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [aggregatedData, setAggregatedData] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (params: MetricsQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.findAll(params);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAggregatedMetrics = useCallback(async (params: MetricsQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await metricsService.aggregateMetrics(params);
      setAggregatedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch aggregated metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMetric = useCallback(async (metric: Partial<Metrics>) => {
    try {
      setLoading(true);
      setError(null);
      const newMetric = await metricsService.create(metric);
      setMetrics(prev => [...prev, newMetric]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create metric');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMetric = useCallback(async (id: string, metric: Partial<Metrics>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMetric = await metricsService.update(id, metric);
      setMetrics(prev => prev.map(m => (m._id === id ? updatedMetric : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metric');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMetric = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await metricsService.delete(id);
      setMetrics(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete metric');
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    metrics,
    aggregatedData,
    loading,
    error,
    fetchMetrics,
    fetchAggregatedMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
  };

  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;
};

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};
