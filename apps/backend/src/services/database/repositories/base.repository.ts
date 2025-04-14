import { Collection, Filter, FindOptions, UpdateFilter } from 'mongodb';
import { MongoDBService } from '../mongodb.service';
import { BaseSchema } from '../schemas/base.schema';

export abstract class BaseRepository<T extends BaseSchema> {
  protected abstract readonly collectionName: string;

  constructor(protected readonly mongoDBService: MongoDBService) {}

  protected async getCollection(): Promise<Collection<T>> {
    return this.mongoDBService.getCollection<T>(this.collectionName);
  }

  async findOne(filter: Filter<T>, options?: FindOptions): Promise<T | null> {
    const collection = await this.getCollection();
    return collection.findOne(filter, options);
  }

  async find(filter: Filter<T>, options?: FindOptions): Promise<T[]> {
    const collection = await this.getCollection();
    return collection.find(filter, options).toArray();
  }

  async create(document: Omit<T, keyof BaseSchema>): Promise<T> {
    const collection = await this.getCollection();
    const now = new Date();
    const newDocument = {
      ...document,
      _id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T;
    
    await collection.insertOne(newDocument);
    return newDocument;
  }

  async update(filter: Filter<T>, update: UpdateFilter<T>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.updateOne(filter, {
      ...update,
      $set: {
        ...(update.$set || {}),
        updatedAt: new Date(),
      },
    });
    return result.modifiedCount > 0;
  }

  async delete(filter: Filter<T>): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  async count(filter: Filter<T>): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments(filter);
  }
} 