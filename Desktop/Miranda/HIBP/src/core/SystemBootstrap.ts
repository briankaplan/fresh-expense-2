import { Application } from './Application';
import { DatabaseService } from '../services';
import { AppConfig } from '../config';
import { AppError, ErrorCodes } from '../utils/error';

export class SystemBootstrap {
  private static instance: SystemBootstrap;
  private app: Application;

  private constructor() {
    this.app = Application.getInstance();
  }

  static getInstance(): SystemBootstrap {
    if (!SystemBootstrap.instance) {
      SystemBootstrap.instance = new SystemBootstrap();
    }
    return SystemBootstrap.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize core services
      await DatabaseService.initialize();
      
      // Load configuration
      await this.loadConfiguration();
      
      // Initialize event listeners
      this.setupEventListeners();
      
    } catch (error) {
      throw new AppError(
        'Failed to bootstrap system',
        ErrorCodes.VALIDATION_ERROR,
        error
      );
    }
  }

  private async loadConfiguration(): Promise<void> {
    // Load and validate configuration
    if (!AppConfig.api.hibp.baseUrl) {
      throw new AppError(
        'Invalid HIBP API configuration',
        ErrorCodes.VALIDATION_ERROR
      );
    }
  }

  private setupEventListeners(): void {
    this.app.on('error', this.handleError.bind(this));
    this.app.on('passwordUpdate', this.handlePasswordUpdate.bind(this));
  }

  private handleError(error: Error): void {
    console.error('System error:', error);
    // Implement error reporting logic
  }

  private handlePasswordUpdate(data: any): void {
    // Handle password update events
  }
} 