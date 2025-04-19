import { validate } from 'class-validator';
import { UpdateMetricsDto } from './update-metrics.dto';
import { MetricType } from '@expense/types';

describe('UpdateMetricsDto', () => {
  it('should validate an empty update DTO', async () => {
    const dto = new UpdateMetricsDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a partial update with userId', async () => {
    const dto = new UpdateMetricsDto();
    dto.userId = 'new-user-id';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a partial update with metricType', async () => {
    const dto = new UpdateMetricsDto();
    dto.metricType = 'income' as MetricType;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a partial update with value', async () => {
    const dto = new UpdateMetricsDto();
    dto.value = 200.75;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a partial update with metadata', async () => {
    const dto = new UpdateMetricsDto();
    dto.metadata = { category: 'transport', period: '2024-02' };

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if userId is not a string', async () => {
    const dto = new UpdateMetricsDto();
    dto.userId = 123 as any;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation if metricType is not a valid type', async () => {
    const dto = new UpdateMetricsDto();
    dto.metricType = 'invalid-type' as MetricType;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });

  it('should fail validation if value is not a number', async () => {
    const dto = new UpdateMetricsDto();
    dto.value = 'not a number' as any;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isNumber');
  });

  it('should fail validation if metadata is not an object', async () => {
    const dto = new UpdateMetricsDto();
    dto.metadata = 'not an object' as any;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isObject');
  });

  it('should validate a complete update', async () => {
    const dto = new UpdateMetricsDto();
    dto.userId = 'new-user-id';
    dto.metricType = 'income' as MetricType;
    dto.value = 200.75;
    dto.metadata = { category: 'transport', period: '2024-02' };

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
