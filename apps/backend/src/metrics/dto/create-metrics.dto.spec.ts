import type { MetricType } from "@expense/types";
import { validate } from "class-validator";

import { CreateMetricsDto } from "./create-metrics.dto";

describe("CreateMetricsDto", () => {
  it("should validate a correct metrics DTO", async () => {
    const dto = new CreateMetricsDto();
    dto.userId = "test-user-id";
    dto.metricType = "spending" as MetricType;
    dto.value = 100.5;
    dto.metadata = { category: "food", period: "2024-01" };

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation if userId is missing", async () => {
    const dto = new CreateMetricsDto();
    dto.metricType = "spending" as MetricType;
    dto.value = 100.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty("isString");
  });

  it("should fail validation if metricType is missing", async () => {
    const dto = new CreateMetricsDto();
    dto.userId = "test-user-id";
    dto.value = 100.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty("isString");
  });

  it("should fail validation if value is missing", async () => {
    const dto = new CreateMetricsDto();
    dto.userId = "test-user-id";
    dto.metricType = "spending" as MetricType;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty("isNumber");
  });

  it("should fail validation if value is not a number", async () => {
    const dto = new CreateMetricsDto();
    dto.userId = "test-user-id";
    dto.metricType = "spending" as MetricType;
    dto.value = "not a number" as any;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty("isNumber");
  });

  it("should fail validation if metricType is not a valid type", async () => {
    const dto = new CreateMetricsDto();
    dto.userId = "test-user-id";
    dto.metricType = "invalid-type" as MetricType;
    dto.value = 100.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty("isEnum");
  });

  it("should validate with optional metadata", async () => {
    const dto = new CreateMetricsDto();
    dto.userId = "test-user-id";
    dto.metricType = "spending" as MetricType;
    dto.value = 100.5;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation if metadata is not an object", async () => {
    const dto = new CreateMetricsDto();
    dto.userId = "test-user-id";
    dto.metricType = "spending" as MetricType;
    dto.value = 100.5;
    dto.metadata = "not an object" as any;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty("isObject");
  });
});
