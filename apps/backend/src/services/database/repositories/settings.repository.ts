import { Filter, FindOptions } from "mongodb";
import type { MongoDBService } from "../mongodb.service";
import { SETTINGS_COLLECTION, type SettingsSchema } from "../schemas/settings.schema";
import { BaseRepository } from "./base.repository";

export class SettingsRepository extends BaseRepository<SettingsSchema> {
  protected readonly collectionName = SETTINGS_COLLECTION;

  constructor(mongoDBService: MongoDBService) {
    super(mongoDBService);
  }

  async findByUserId(userId: string): Promise<SettingsSchema | null> {
    return this.findOne({ userId });
  }

  async updateNotificationSettings(
    userId: string,
    settings: Partial<SettingsSchema["notifications"]>,
  ): Promise<boolean> {
    return this.update(
      { userId },
      {
        $set: { notifications: settings },
      },
    );
  }

  async updateBudgetSettings(
    userId: string,
    settings: Partial<SettingsSchema["budget"]>,
  ): Promise<boolean> {
    return this.update(
      { userId },
      {
        $set: { budget: settings },
      },
    );
  }

  async updateUserPreferences(
    userId: string,
    preferences: {
      theme?: SettingsSchema["theme"];
      language?: string;
      timezone?: string;
      dateFormat?: string;
      currencyFormat?: string;
    },
  ): Promise<boolean> {
    return this.update(
      { userId },
      {
        $set: preferences,
      },
    );
  }

  async getDefaultSettings(): Promise<Partial<SettingsSchema>> {
    return {
      notifications: {
        email: true,
        push: true,
        inApp: true,
        frequency: "immediate",
      },
      budget: {
        defaultCurrency: "USD",
        defaultPeriod: "monthly",
        rolloverUnused: false,
        alertThreshold: 80,
      },
      theme: "system",
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      currencyFormat: "$0,0.00",
    };
  }
}
