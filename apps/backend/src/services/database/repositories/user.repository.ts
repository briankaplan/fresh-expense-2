import { Filter, FindOptions } from "mongodb";

import { BaseRepository } from "./base.repository";
import type { MongoDBService } from "../mongodb.service";
import { USER_COLLECTION, type UserSchema } from "../schemas/user.schema";

export class UserRepository extends BaseRepository<UserSchema> {
  protected readonly collectionName = USER_COLLECTION;

  async findByEmail(email: string): Promise<UserSchema | null> {
    return this.findOne({ email });
  }

  async findActiveUsers(): Promise<UserSchema[]> {
    return this.find({ isActive: true });
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    return this.update({ _id: userId }, { $set: { lastLogin: new Date() } });
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<UserSchema["preferences"]>,
  ): Promise<boolean> {
    return this.update({ _id: userId }, { $set: { preferences } });
  }
}
