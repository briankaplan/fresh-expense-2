import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MetricsService } from './metrics.service';
import { Metrics, MetricsQueryParams } from '@fresh-expense/types';

describe('MetricsService', () => {
  let service: MetricsService;
  let model: Model<Metrics>;

  const mockMetrics: Metrics = {
    _id: '1',
    type: 'expense',
    value: 100,
    userId: 'user1',
    category: 'general',
    description: 'Test expense',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMetricsModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getModelToken('Metrics'),
          useValue: mockMetricsModel,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    model = module.get<Model<Metrics>>(getModelToken('Metrics'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new metric', async () => {
    const newMetric: Metrics = {
      _id: '1',
      type: 'expense',
      value: 100,
      userId: 'user1',
      category: 'general',
      description: 'Test expense',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockMetricsModel.create.mockResolvedValue(mockMetrics);

    const result = await service.create(newMetric);
    expect(result).toEqual(mockMetrics);
    expect(mockMetricsModel.create).toHaveBeenCalledWith(newMetric);
  });

  describe('findAll', () => {
    it('should return an array of metrics', async () => {
      const metrics = [mockMetrics];
      mockMetricsModel.find.mockResolvedValue(metrics);

      const queryParams: MetricsQueryParams = { userId: 'user1' };
      const result = await service.findAll(queryParams);
      expect(result).toEqual(metrics);
      expect(mockMetricsModel.find).toHaveBeenCalled();
    });
  });

  describe('findByType', () => {
    it('should return metrics of a specific type', async () => {
      const metrics = [mockMetrics];
      mockMetricsModel.find.mockResolvedValue(metrics);

      const result = await service.findByType('expense');
      expect(result).toEqual(metrics);
      expect(mockMetricsModel.find).toHaveBeenCalledWith({ type: 'expense' });
    });
  });

  describe('findOne', () => {
    it('should return a single metric', async () => {
      mockMetricsModel.findOne.mockResolvedValue(mockMetrics);

      const result = await service.findOne('1');
      expect(result).toEqual(mockMetrics);
      expect(mockMetricsModel.findOne).toHaveBeenCalledWith({ _id: '1' });
    });
  });

  describe('update', () => {
    it('should update a metric', async () => {
      const updateData = { value: 200 };
      mockMetricsModel.findByIdAndUpdate.mockResolvedValue({
        ...mockMetrics,
        ...updateData,
      });

      const result = await service.update('1', updateData);
      expect(result).toEqual({ ...mockMetrics, ...updateData });
      expect(mockMetricsModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updateData, {
        new: true,
      });
    });
  });

  describe('remove', () => {
    it('should delete a metric', async () => {
      mockMetricsModel.findByIdAndDelete.mockResolvedValue(mockMetrics);

      await service.remove('1');
      expect(mockMetricsModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });
  });
});
