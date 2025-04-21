import { Injectable, Logger } from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";

import type { NotificationService } from "./notification/notification.service";

export interface ServiceState {
  isConnected: boolean;
  lastSyncDate?: Date;
  lastError?: Error;
  metadata?: Record<string, any>;
}

@Injectable()
export abstract class BaseService {
  protected readonly logger: Logger;
  protected state: ServiceState = {
    isConnected: false,
  };

  constructor(
    protected readonly notificationService: NotificationService,
    protected readonly eventEmitter: EventEmitter2,
    serviceName: string,
  ) {
    this.logger = new Logger(serviceName);
  }

  protected updateState(update: Partial<ServiceState>) {
    this.state = { ...this.state, ...update };
    this.eventEmitter.emit(`${this.constructor.name}.stateChanged`, this.state);
  }

  protected async notify(
    type: "success" | "error" | "info" | "warning",
    message: string,
    metadata?: Record<string, any>,
  ) {
    await this.notificationService.notify({
      type,
      title: this.constructor.name,
      message,
      metadata,
    });
  }

  protected async executeWithRetry<T>(
    operation: string,
    fn: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        this.updateState({ lastError: undefined });
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.updateState({ lastError });

        if (attempt < maxRetries) {
          this.logger.warn(`Retry ${attempt}/${maxRetries} for ${operation}`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }

  protected async executeWithLoading<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.eventEmitter.emit("loading.started", {
      operationId: operation,
      timestamp: new Date(),
    });

    try {
      const result = await fn();
      this.eventEmitter.emit("loading.completed", {
        operationId: operation,
        timestamp: new Date(),
      });
      return result;
    } catch (error) {
      this.eventEmitter.emit("loading.error", {
        operationId: operation,
        error,
        timestamp: new Date(),
      });
      throw error;
    }
  }
}
