import { Injectable } from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";

import { BaseService } from "./base.service";
import type { NotificationService } from "./notification/notification.service";

export interface ServiceState {
  isConnected: boolean;
  lastSync?: Date;
  error?: Error;
  metadata?: Record<string, any>;
}

@Injectable()
export class ServiceManagerService extends BaseService {
  private readonly serviceStates: Map<string, ServiceState> = new Map();

  constructor(notificationService: NotificationService, eventEmitter: EventEmitter2) {
    super(notificationService, eventEmitter, ServiceManagerService.name);
  }

  async executeWithRetry<T>(operation: string, fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    return super.executeWithRetry(operation, fn, maxRetries);
  }

  private updateServiceState(serviceName: string, state: Partial<ServiceState>): void {
    const currentState = this.serviceStates.get(serviceName) || {
      isConnected: false,
    };
    const newState = { ...currentState, ...state };
    this.serviceStates.set(serviceName, newState);

    this.eventEmitter.emit("service.state.changed", {
      serviceName,
      state: newState,
      timestamp: new Date(),
    });
  }

  getServiceState(serviceName: string): ServiceState {
    return this.serviceStates.get(serviceName) || { isConnected: false };
  }

  async executeWithLoading<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    return super.executeWithLoading(operation, fn);
  }

  async executeWithNotification<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      const result = await fn();
      await this.notify("success", `Operation ${operation} completed successfully`);
      return result;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      await this.notify("error", `Operation ${operation} failed: ${typedError.message}`);
      throw typedError;
    }
  }
}
