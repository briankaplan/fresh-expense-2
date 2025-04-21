import type {
  MetricType,
  Metrics,
  MetricsAggregation,
  MetricsQueryParams,
  MetricsTrend,
} from "@fresh-expense/types";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, PipelineStage } from "mongoose";

import { type MetricsDocument, MetricsModel } from "./metrics.schema";

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(@InjectModel(MetricsModel.name) private metricsModel: Model<MetricsDocument>) {}

  private toMetrics(doc: MetricsDocument): Metrics {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      value: doc.value,
      timestamp: doc.timestamp,
      metadata: doc.metadata,
    };
  }

  /**
   * Creates a new metrics record
   * @param metrics The metrics data to create
   * @returns The created metrics document
   */
  async create(createMetricsDto: Metrics): Promise<Metrics> {
    try {
      this.logger.log(`Creating new metrics for user ${createMetricsDto.userId}`);
      const createdMetrics = new this.metricsModel(createMetricsDto);
      const saved = await createdMetrics.save();
      return this.toMetrics(saved);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to create metrics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to create metrics: ${errorMessage}`);
    }
  }

  /**
   * Finds all metrics for a given user
   * @param query Query parameters for finding metrics
   * @returns Array of metrics documents
   */
  async findAll(query: MetricsQueryParams): Promise<Metrics[]> {
    try {
      this.logger.log(`Finding all metrics for user ${query.userId}`);
      const { userId, startDate, endDate, type } = query;
      const filter: any = { userId };

      if (startDate) filter.timestamp = { ...filter.timestamp, $gte: new Date(startDate) };
      if (endDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(endDate) };
      if (type) filter.type = type;

      const metrics = await this.metricsModel.find(filter).exec();
      return metrics.map(this.toMetrics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to find metrics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to find metrics: ${errorMessage}`);
    }
  }

  /**
   * Finds metrics by type for a given user
   * @param type The type of metrics to find
   * @returns Array of metrics documents
   */
  async findByType(type: MetricType): Promise<Metrics[]> {
    try {
      this.logger.log(`Finding metrics of type ${type}`);
      const metrics = await this.metricsModel.find({ type }).exec();
      return metrics.map(this.toMetrics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to find metrics by type: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to find metrics by type: ${errorMessage}`);
    }
  }

  /**
   * Finds a single metrics record by ID
   * @param id The ID of the metrics record to find
   * @returns The metrics document
   */
  async findOne(id: string): Promise<Metrics> {
    try {
      this.logger.log(`Finding metrics with ID ${id}`);
      const metrics = await this.metricsModel.findById(id).exec();
      if (!metrics) {
        throw new NotFoundException(`Metrics with ID ${id} not found`);
      }
      return this.toMetrics(metrics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to find metrics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to find metrics: ${errorMessage}`);
    }
  }

  /**
   * Updates a metrics record
   * @param id The ID of the metrics record to update
   * @param updateMetricsDto The data to update
   * @returns The updated metrics document
   */
  async update(id: string, updateMetricsDto: Partial<Metrics>): Promise<Metrics> {
    try {
      this.logger.log(`Updating metrics with ID ${id}`);
      const updatedMetrics = await this.metricsModel
        .findByIdAndUpdate(id, updateMetricsDto, { new: true })
        .exec();
      if (!updatedMetrics) {
        throw new NotFoundException(`Metrics with ID ${id} not found`);
      }
      return this.toMetrics(updatedMetrics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to update metrics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to update metrics: ${errorMessage}`);
    }
  }

  /**
   * Removes a metrics record
   * @param id The ID of the metrics record to remove
   */
  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Removing metrics with ID ${id}`);
      const result = await this.metricsModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Metrics with ID ${id} not found`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to remove metrics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to remove metrics: ${errorMessage}`);
    }
  }

  /**
   * Aggregates metrics data
   * @param query Query parameters for aggregation
   * @returns Aggregated metrics data
   */
  async aggregateMetrics(query: MetricsQueryParams): Promise<MetricsAggregation> {
    try {
      this.logger.log(`Aggregating metrics for user ${query.userId}`);
      const { userId, startDate, endDate, type } = query;
      const matchStage: any = { userId };

      if (startDate)
        matchStage.timestamp = {
          ...matchStage.timestamp,
          $gte: new Date(startDate),
        };
      if (endDate)
        matchStage.timestamp = {
          ...matchStage.timestamp,
          $lte: new Date(endDate),
        };
      if (type) matchStage.type = type;

      const pipeline: PipelineStage[] = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: "$value" },
            average: { $avg: "$value" },
            count: { $sum: 1 },
            min: { $min: "$value" },
            max: { $max: "$value" },
          },
        },
      ];

      const result = await this.metricsModel.aggregate(pipeline).exec();
      return result[0] || { total: 0, average: 0, count: 0, min: 0, max: 0 };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to aggregate metrics: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to aggregate metrics: ${errorMessage}`);
    }
  }

  /**
   * Gets metrics trend data
   * @param query Query parameters for trend calculation
   * @returns Array of trend data points
   */
  async getMetricsTrend(query: MetricsQueryParams): Promise<MetricsTrend[]> {
    try {
      this.logger.log(`Calculating metrics trend for user ${query.userId}`);
      const { userId, startDate, endDate, type } = query;
      const matchStage: any = { userId };

      if (startDate)
        matchStage.timestamp = {
          ...matchStage.timestamp,
          $gte: new Date(startDate),
        };
      if (endDate)
        matchStage.timestamp = {
          ...matchStage.timestamp,
          $lte: new Date(endDate),
        };
      if (type) matchStage.type = type;

      const pipeline: PipelineStage[] = [
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            value: { $sum: "$value" },
          },
        },
        { $sort: { _id: 1 } },
      ];

      const result = await this.metricsModel.aggregate(pipeline).exec();
      return result.map((item) => ({
        period: item._id,
        value: item.value,
        change: 0, // This would need to be calculated based on previous period
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(
        `Failed to calculate metrics trend: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Failed to calculate metrics trend: ${errorMessage}`);
    }
  }
}
