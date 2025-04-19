import type { UserPreferences, UserSettings } from "./user.interface";

export interface Settings {
  id: string;
  userId: string;
  settings: UserSettings;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
