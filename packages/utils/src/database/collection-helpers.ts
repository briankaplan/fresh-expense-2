import { Collection, ObjectId, Document, WithId } from 'mongodb';
import { NotFoundException } from '@nestjs/common';

/**
 * Find an entity by ID with optional user ID check
 * Throws NotFoundException if not found
 */
export async function findEntityById<T extends Document & { _id: string | ObjectId }>(
  collection: Collection<T>,
  id: string,
  userId?: string,
  errorMessage = 'Entity not found'
): Promise<WithId<T>> {
  const query: any = { _id: new ObjectId(id) };

  // Add userId filter if provided
  if (userId) {
    query.userId = userId;
  }

  const entity = await collection.findOne(query);

  if (!entity) {
    throw new NotFoundException(errorMessage);
  }

  return entity;
}

/**
 * Update an entity by ID with optional user ID check
 * Returns the updated entity
 * Throws NotFoundException if not found
 */
export async function updateEntity<T extends Document & { _id: string | ObjectId }>(
  collection: Collection<T>,
  id: string,
  update: Partial<T>,
  userId?: string,
  errorMessage = 'Entity not found'
): Promise<WithId<T>> {
  const query: any = { _id: new ObjectId(id) };

  // Add userId filter if provided
  if (userId) {
    query.userId = userId;
  }

  const result = await collection.findOneAndUpdate(
    query,
    { $set: update },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new NotFoundException(errorMessage);
  }

  return result;
}

/**
 * Delete an entity by ID with optional user ID check
 * Returns true if deleted, false if not found
 */
export async function deleteEntity<T extends Document & { _id: string | ObjectId }>(
  collection: Collection<T>,
  id: string,
  userId?: string
): Promise<boolean> {
  const query: any = { _id: new ObjectId(id) };

  // Add userId filter if provided
  if (userId) {
    query.userId = userId;
  }

  const result = await collection.deleteOne(query);
  return result.deletedCount > 0;
}

/**
 * Build a date range query for MongoDB
 */
export function buildDateRangeQuery(
  field: string,
  startDate?: Date,
  endDate?: Date
): Record<string, any> {
  const query: Record<string, any> = {};

  if (startDate || endDate) {
    query[field] = {};
    if (startDate) {
      query[field].$gte = startDate;
    }
    if (endDate) {
      query[field].$lte = endDate;
    }
  }

  return query;
}

/**
 * Create pagination parameters for MongoDB queries
 */
export function createPaginationParams(page = 1, limit = 10): { skip: number; limit: number } {
  return {
    skip: (page - 1) * limit,
    limit,
  };
}

/**
 * Sort options for MongoDB queries
 */
export type SortOptions = {
  [key: string]: 1 | -1;
};

/**
 * Create a MongoDB sort object from a string like "field:asc" or "field:desc"
 */
export function createSortOptions(sortString?: string): SortOptions {
  if (!sortString) {
    return { _id: -1 }; // Default sort by _id desc
  }

  const [field, direction] = sortString.split(':');
  return {
    [field]: direction?.toLowerCase() === 'desc' ? -1 : 1,
  };
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  items: WithId<T>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get paginated results from a collection
 */
export async function getPaginatedResults<T extends Document>(
  collection: Collection<T>,
  query: Record<string, any>,
  page = 1,
  limit = 10,
  sort?: SortOptions
): Promise<PaginatedResponse<T>> {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    collection
      .find(query)
      .sort(sort || { _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Calculate the next date based on frequency
 */
export function calculateNextDate(
  currentDate: Date | string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
): Date {
  const nextDate = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }

  return nextDate;
}
