import {
  ApiResponse,
  type MetricType,
  Metrics,
  type MetricsQueryParams,
} from "@fresh-expense/types";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import type { CreateMetricsDto } from "./dto/create-metrics.dto";
import type { UpdateMetricsDto } from "./dto/update-metrics.dto";
import type { MetricsService } from "./metrics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("metrics")
@ApiBearerAuth()
@Controller("metrics")
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  @ApiOperation({ summary: "Create new metrics" })
  @ApiResponse({
    status: 201,
    description: "The metrics has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad request." })
  async create(@Body() createMetricsDto: CreateMetricsDto) {
    return this.metricsService.create(createMetricsDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all metrics for a user" })
  @ApiResponse({ status: 200, description: "Return all metrics for the user." })
  async findAll(@Query() query: MetricsQueryParams) {
    return this.metricsService.findAll(query);
  }

  @Get("type/:type")
  @ApiOperation({ summary: "Get metrics by type for a user" })
  @ApiResponse({
    status: 200,
    description: "Return metrics of specified type for the user.",
  })
  async findByType(@Param("type") type: MetricType) {
    return this.metricsService.findByType(type);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get metrics by ID" })
  @ApiResponse({ status: 200, description: "Return the metrics." })
  @ApiResponse({ status: 404, description: "Metrics not found." })
  async findOne(@Param("id") id: string) {
    return this.metricsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update metrics" })
  @ApiResponse({
    status: 200,
    description: "The metrics has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Metrics not found." })
  async update(@Param("id") id: string, @Body() updateMetricsDto: UpdateMetricsDto) {
    return this.metricsService.update(id, updateMetricsDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete metrics" })
  @ApiResponse({
    status: 200,
    description: "The metrics has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Metrics not found." })
  async remove(@Param("id") id: string) {
    return this.metricsService.remove(id);
  }

  @Get("aggregate")
  @ApiOperation({ summary: "Aggregate metrics" })
  @ApiResponse({ status: 200, description: "Return aggregated metrics data." })
  async aggregateMetrics(@Query() queryParams: MetricsQueryParams) {
    return this.metricsService.aggregateMetrics(queryParams);
  }

  @Get("trend")
  getMetricsTrend(@Query() queryParams: MetricsQueryParams) {
    return this.metricsService.getMetricsTrend(queryParams);
  }
}
