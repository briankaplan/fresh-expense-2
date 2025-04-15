import { describe, it, expect, vi } from 'vitest';
import { Collection, ObjectId, Document } from 'mongodb';
import { NotFoundException } from '@nestjs/common';
import {
  findEntityById,
  updateEntity,
  deleteEntity,
  buildDateRangeQuery,
  createPaginationParams,
  createSortOptions,
  getPaginatedResults,
} from './collection-helpers';

interface TestDocument extends Document {
  _id: ObjectId;
  name?: string;
}

describe('Database Collection Helpers', () => {
  describe('findEntityById', () => {
    it('should find entity by ID', async () => {
      const mockEntity = { _id: new ObjectId(), name: 'Test' } as TestDocument;
      const mockCollection = {
        findOne: vi.fn().mockResolvedValue(mockEntity),
      } as unknown as Collection<TestDocument>;

      const result = await findEntityById(mockCollection, mockEntity._id.toString());
      expect(result).toEqual(mockEntity);
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should throw NotFoundException when entity not found', async () => {
      const mockCollection = {
        findOne: vi.fn().mockResolvedValue(null),
      } as unknown as Collection<TestDocument>;

      await expect(findEntityById(mockCollection, new ObjectId().toString())).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateEntity', () => {
    it('should update entity by ID', async () => {
      const mockEntity = { _id: new ObjectId(), name: 'Updated' } as TestDocument;
      const mockCollection = {
        findOneAndUpdate: vi.fn().mockResolvedValue(mockEntity),
      } as unknown as Collection<TestDocument>;

      const result = await updateEntity(mockCollection, mockEntity._id.toString(), {
        name: 'Updated',
      });

      expect(result).toEqual(mockEntity);
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { name: 'Updated' } },
        { returnDocument: 'after' }
      );
    });

    it('should throw NotFoundException when entity not found', async () => {
      const mockCollection = {
        findOneAndUpdate: vi.fn().mockResolvedValue(null),
      } as unknown as Collection<TestDocument>;

      await expect(updateEntity(mockCollection, new ObjectId().toString(), {})).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('deleteEntity', () => {
    it('should delete entity by ID', async () => {
      const mockCollection = {
        deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      } as unknown as Collection<TestDocument>;

      const result = await deleteEntity(mockCollection, new ObjectId().toString());
      expect(result).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return false when entity not found', async () => {
      const mockCollection = {
        deleteOne: vi.fn().mockResolvedValue({ deletedCount: 0 }),
      } as unknown as Collection<TestDocument>;

      const result = await deleteEntity(mockCollection, new ObjectId().toString());
      expect(result).toBe(false);
    });
  });

  describe('buildDateRangeQuery', () => {
    it('should build date range query with both dates', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = buildDateRangeQuery('date', startDate, endDate);

      expect(result).toEqual({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });
    });

    it('should build date range query with only start date', () => {
      const startDate = new Date('2024-01-01');
      const result = buildDateRangeQuery('date', startDate);

      expect(result).toEqual({
        date: {
          $gte: startDate,
        },
      });
    });

    it('should return empty object when no dates provided', () => {
      const result = buildDateRangeQuery('date');
      expect(result).toEqual({});
    });
  });

  describe('createPaginationParams', () => {
    it('should create pagination params with default values', () => {
      const result = createPaginationParams();
      expect(result).toEqual({ skip: 0, limit: 10 });
    });

    it('should create pagination params with custom values', () => {
      const result = createPaginationParams(3, 20);
      expect(result).toEqual({ skip: 40, limit: 20 });
    });
  });

  describe('createSortOptions', () => {
    it('should create ascending sort options', () => {
      const result = createSortOptions('name:asc');
      expect(result).toEqual({ name: 1 });
    });

    it('should create descending sort options', () => {
      const result = createSortOptions('date:desc');
      expect(result).toEqual({ date: -1 });
    });

    it('should use default sort when no sort string provided', () => {
      const result = createSortOptions();
      expect(result).toEqual({ _id: -1 });
    });
  });

  describe('getPaginatedResults', () => {
    it('should get paginated results', async () => {
      const mockItems = [{ _id: new ObjectId(), name: 'Item 1' }] as TestDocument[];
      const mockCollection = {
        find: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnThis(),
          skip: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue(mockItems),
        }),
        countDocuments: vi.fn().mockResolvedValue(1),
      } as unknown as Collection<TestDocument>;

      const result = await getPaginatedResults(mockCollection, {});

      expect(result).toEqual({
        items: mockItems,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
