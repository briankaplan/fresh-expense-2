import { type MetricType, Metrics } from "@fresh-expense/types";
import { Test, type TestingModule } from "@nestjs/testing";
import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";

describe("MetricsController", () => {
  let controller: MetricsController;
  let service: MetricsService;

  const mockMetrics = {
    userId: "test-user",
    type: "expense" as MetricType,
    category: "food",
    value: 100,
    description: "Test expense",
  };

  const mockMetricsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByType: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    aggregateMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    service = module.get<MetricsService>(MetricsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new metric", async () => {
      const createdMetric = { ...mockMetrics, _id: "1" };
      mockMetricsService.create.mockResolvedValue(createdMetric);

      const result = await controller.create(mockMetrics);
      expect(result).toEqual(createdMetric);
      expect(mockMetricsService.create).toHaveBeenCalledWith(mockMetrics);
    });
  });

  describe("findAll", () => {
    it("should return all metrics for a user", async () => {
      const metrics = [{ ...mockMetrics, _id: "1" }];
      mockMetricsService.findAll.mockResolvedValue(metrics);

      const result = await controller.findAll({ userId: "test-user" });
      expect(result).toEqual(metrics);
      expect(mockMetricsService.findAll).toHaveBeenCalledWith({
        userId: "test-user",
      });
    });
  });

  describe("findByType", () => {
    it("should return metrics by type", async () => {
      const metrics = [{ ...mockMetrics, _id: "1" }];
      mockMetricsService.findByType.mockResolvedValue(metrics);

      const result = await controller.findByType("expense");
      expect(result).toEqual(metrics);
      expect(mockMetricsService.findByType).toHaveBeenCalledWith("expense");
    });
  });

  describe("findOne", () => {
    it("should return a metric by id", async () => {
      const metric = { ...mockMetrics, _id: "1" };
      mockMetricsService.findOne.mockResolvedValue(metric);

      const result = await controller.findOne("1");
      expect(result).toEqual(metric);
      expect(mockMetricsService.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("update", () => {
    it("should update a metric", async () => {
      const updatedMetric = { ...mockMetrics, _id: "1", value: 200 };
      mockMetricsService.update.mockResolvedValue(updatedMetric);

      const result = await controller.update("1", { value: 200 });
      expect(result).toEqual(updatedMetric);
      expect(mockMetricsService.update).toHaveBeenCalledWith("1", {
        value: 200,
      });
    });
  });

  describe("remove", () => {
    it("should delete a metric", async () => {
      mockMetricsService.remove.mockResolvedValue(undefined);

      await controller.remove("1");
      expect(mockMetricsService.remove).toHaveBeenCalledWith("1");
    });
  });

  describe("aggregateMetrics", () => {
    it("should aggregate metrics", async () => {
      const aggregationResult = {
        total: 100,
        average: 50,
        count: 2,
        min: 0,
        max: 100,
      };

      mockMetricsService.aggregateMetrics.mockResolvedValue(aggregationResult);

      const result = await controller.aggregateMetrics({ userId: "test-user" });
      expect(result).toEqual(aggregationResult);
      expect(mockMetricsService.aggregateMetrics).toHaveBeenCalledWith({
        userId: "test-user",
      });
    });
  });
});
