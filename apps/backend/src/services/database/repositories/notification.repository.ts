import { Filter, FindOptions, UpdateFilter } from 'mongodb';
import { MongoDBService } from '../mongodb.service';
import { NotificationSchema, NOTIFICATION_COLLECTION } from '../schemas/notification.schema';
import { BaseRepository } from './base.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseSchema } from '../schemas/base.schema';
import { ObjectId, Document, InsertOneResult, UpdateResult, DeleteResult, Collection } from 'mongodb';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationSchema> {
  protected readonly collectionName = NOTIFICATION_COLLECTION;

  constructor(private readonly mongoDBService: MongoDBService) {
    super(mongoDBService);
  }

  private async getCollection(): Promise<Collection<NotificationSchema>> {
    return this.mongoDBService.getCollection<NotificationSchema>(NOTIFICATION_COLLECTION);
  }

  async findById(id: string): Promise<NotificationSchema | null> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { _id: new ObjectId(id) };
    return collection.findOne(filter);
  }

  async findByUserId(userId: string): Promise<NotificationSchema[]> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { userId };
    return collection.find(filter).toArray();
  }

  async findByStatus(
    userId: string,
    status: NotificationSchema['status']
  ): Promise<NotificationSchema[]> {
    const collection = await this.getCollection();
    return collection.find({ userId, status }).toArray();
  }

  async findByType(
    userId: string,
    type: NotificationSchema['type']
  ): Promise<NotificationSchema[]> {
    const collection = await this.getCollection();
    return collection.find({ userId, type }).toArray();
  }

  async getUnreadCount(userId: string): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments({ userId, status: 'unread' });
  }

  async markAsRead(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { _id: new ObjectId(id) };
    const update: UpdateFilter<NotificationSchema> = { $set: { status: 'read' } };
    const result: UpdateResult = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result: UpdateResult = await collection.updateMany(
      { userId, status: 'unread' },
      { $set: { status: 'read' } }
    );
    return result.modifiedCount > 0;
  }

  async markAsArchived(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { _id: new ObjectId(id) };
    const update: UpdateFilter<NotificationSchema> = { $set: { status: 'archived' } };
    const result: UpdateResult = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  async getRecentNotifications(
    userId: string,
    limit: number = 10
  ): Promise<NotificationSchema[]> {
    const collection = await this.getCollection();
    return collection.find(
      { userId },
      {
        sort: { createdAt: -1 },
        limit,
      }
    ).toArray();
  }

  async create(data: Omit<NotificationSchema, '_id' | 'createdAt' | 'updatedAt'>): Promise<NotificationSchema> {
    const collection = await this.getCollection();
    const now = new Date();
    const notification: NotificationSchema = {
      ...data,
      _id: new ObjectId(),
      createdAt: now,
      updatedAt: now,
    };
    await collection.insertOne(notification);
    return notification;
  }

  async update(id: string, data: Partial<Omit<NotificationSchema, '_id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { _id: new ObjectId(id) };
    const update: UpdateFilter<NotificationSchema> = { 
      $set: { ...data, updatedAt: new Date() } 
    };
    const result: UpdateResult = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { _id: new ObjectId(id) };
    const result: DeleteResult = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }
} 