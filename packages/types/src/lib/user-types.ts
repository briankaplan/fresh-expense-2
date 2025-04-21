import { UserRole, UserStatus } from "./enums";

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
    deletedAt?: Date;
}

export interface UserPreferences {
    theme?: "light" | "dark";
    language?: string;
    timezone?: string;
    currency?: string;
    notifications?: {
        email?: boolean;
        push?: boolean;
        inApp?: boolean;
    };
}

export interface UserSettings {
    preferences: UserPreferences;
    metadata?: Record<string, unknown>;
} 