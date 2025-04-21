import { MetricType } from "./metrics.enum";

export interface BaseMetric {
  id: string;
  name: string;
  type: MetricType;
  value: number;
  timestamp: Date;
}

export interface MetricDefinition {
  id: string;
  name: string;
  type: MetricType;
  description?: string;
  unit?: string;
}

export interface MetricValue {
  value: number;
  timestamp: Date;
}

export interface MetricGroup {
  name: string;
  metrics: BaseMetric[];
}

export interface MetricResult {
  definition: MetricDefinition;
  values: MetricValue[];
}

export {
  type BaseMetric,
  type MetricDefinition,
  type MetricValue,
  type MetricGroup,
  type MetricResult,
};
