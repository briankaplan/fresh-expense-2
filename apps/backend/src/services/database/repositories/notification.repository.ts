import { Injectable, NotFoundException } from "@nestjs/common";
import { type Filter, FindOptions, type UpdateFilter ,
  type Collection,
  type DeleteResult,
  Document,
  InsertOneResult,
  ObjectId,
  type UpdateResult,
} from "mongodb";

import { BaseRepository } from "./base.repository";
import type { MongoDBService } from "../mongodb.service";
import { BaseSchema } from "../schemas/base.schema";
import { NOTIFICATION_COLLECTION, type NotificationSchema } from "../schemas/notification.schema";

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
    status: NotificationSchema["status"],
  ): Promise<NotificationSchema[]> {
    const collection = await this.getCollection();
    return collection.find({ userId, status }).toArray();
  }

  async findByType(
    userId: string,
    type: NotificationSchema["type"],
  ): Promise<NotificationSchema[]> {
    const collection = await this.getCollection();
    return collection.find({ userId, type }).toArray();
  }

  async getUnreadCount(userId: string): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments({ userId, status: "matched" });
  }

  async markAsRead(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { _id: new ObjectId(id) };
    const update: UpdateFilter<NotificationSchema> = {
      $set: { status: "matched" },
    };
    const result: UpdateResult = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result: UpdateResult = await collection.updateMany(
      { userId, status: "matched" },
      { $set: { status: "matched" } },
    );
    return result.modifiedCount > 0;
  }

  async markAsArchived(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { _id: new ObjectId(id) };
    const update: UpdateFilter<NotificationSchema> = {
      $set: { status: "matched" },
    };
    const result: UpdateResult = await collection.updateOne(filter, update);
    return result.modifiedCount > 0;
  }

  async getRecentNotifications(userId: string, limit = 10): Promise<NotificationSchema[]> {
    const collection = await this.getCollection();
    return collection
      .find(
        { userId },
        {
          sort: { createdAt: -1 },
          limit,
        },
      )
      .toArray();
  }

  async create(
    data: Omit<NotificationSchema, "_id" | "createdAt" | "updatedAt">,
  ): Promise<NotificationSchema> {
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

  async update(
    id: string,
    data: Partial<Omit<NotificationSchema, "_id" | "createdAt" | "updatedAt">>,
  ): Promise<boolean> {
    const collection = await this.getCollection();
    const filter: Filter<NotificationSchema> = { _id: new ObjectId(id) };
    const update: UpdateFilter<NotificationSchema> = {
      $set: { ...data, updatedAt: new Date() },
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
