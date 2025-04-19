/**
 * Core interfaces that serve as the source of truth for the application
 */

export * from "./user.interface";

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}
