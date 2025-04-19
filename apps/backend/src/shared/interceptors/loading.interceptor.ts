import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";

interface LoadingEvent {
  operationId: string;
  path: string;
  method: string;
  timestamp: Date;
  error?: Error;
}

@Injectable()
export class LoadingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoadingInterceptor.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const operationId = `${request.method}-${request.url}-${Date.now()}`;

    const baseEvent: Omit<LoadingEvent, "error"> = {
      operationId,
      path: request.url,
      method: request.method,
      timestamp: new Date(),
    };

    // Emit loading started event
    this.eventEmitter.emit("loading.started", baseEvent);

    return next.handle().pipe(
      tap({
        next: () => {
          this.eventEmitter.emit("loading.completed", baseEvent);
        },
        error: (error: unknown) => {
          const typedError = error instanceof Error ? error : new Error(String(error));
          this.eventEmitter.emit("loading.error", {
            ...baseEvent,
            error: typedError,
          });
        },
      }),
    );
  }
}
