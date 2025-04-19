import type { Metrics, MetricsAggregation, MetricsQueryParams } from "@fresh-expense/types";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class MetricsService {
  private readonly baseUrl = `${API_URL}/metrics`;

  async findAll(params: MetricsQueryParams): Promise<Metrics[]> {
    const response = await axios.get(this.baseUrl, { params });
    return response.data;
  }

  async findByType(type: string, params: MetricsQueryParams): Promise<Metrics[]> {
    const response = await axios.get(`${this.baseUrl}/type/${type}`, {
      params,
    });
    return response.data;
  }

  async findOne(id: string): Promise<Metrics> {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(metric: Partial<Metrics>): Promise<Metrics> {
    const response = await axios.post(this.baseUrl, metric);
    return response.data;
  }

  async update(id: string, metric: Partial<Metrics>): Promise<Metrics> {
    const response = await axios.put(`${this.baseUrl}/${id}`, metric);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  async aggregateMetrics(params: MetricsQueryParams): Promise<MetricsAggregation> {
    const response = await axios.get(`${this.baseUrl}/aggregate`, { params });
    return response.data;
  }
}

export const metricsService = new MetricsService();
