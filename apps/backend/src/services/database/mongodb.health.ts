import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { MongoDBService } from './mongodb.service';

@Injectable()
export class MongoDBHealthIndicator extends HealthIndicator {
  constructor(private readonly mongoDBService: MongoDBService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isConnected = await this.mongoDBService.isConnected();
      const status = isConnected ? 'up' : 'down';
      
      if (!isConnected) {
        throw new HealthCheckError('MongoDB is not connected', this.getStatus(key, false, { status }));
      }

      return this.getStatus(key, true, {
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof HealthCheckError) {
        throw error;
      }
      throw new HealthCheckError('MongoDB check failed', this.getStatus(key, false, { 
        error: error.message,
        timestamp: new Date().toISOString(),
      }));
    }
  }
} 