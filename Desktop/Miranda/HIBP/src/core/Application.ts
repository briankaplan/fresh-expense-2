import { DatabaseService, SecurityService, PasswordManager } from '../services';
import { EventEmitter } from './EventEmitter';
import { AppConfig } from '../config';
import { AppError, ErrorCodes } from '../utils/error';

export class Application {
  private static instance: Application;
  private eventEmitter: EventEmitter;
  private services: Map<string, any>;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.services = new Map();
    this.initialize();
  }

  static getInstance(): Application {
    if (!Application.instance) {
      Application.instance = new Application();
    }
    return Application.instance;
  }

  private async initialize() {
    try {
      // Initialize services
      await this.initializeServices();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('✅ Application initialized successfully');
    } catch (error) {
      throw new AppError(
        'Application initialization failed',
        ErrorCodes.VALIDATION_ERROR,
        error
      );
    }
  }

  private async initializeServices() {
    // Initialize core services
    const services = [
      ['database', new DatabaseService()],
      ['security', new SecurityService()],
      ['passwords', new PasswordManager()]
    ];

    for (const [name, service] of services) {
      await service.initialize();
      this.services.set(name, service);
    }
  }

  getService<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new AppError(
        `Service ${name} not found`,
        ErrorCodes.VALIDATION_ERROR
      );
    }
    return service as T;
  }

  on(event: string, callback: Function) {
    this.eventEmitter.on(event, callback);
  }

  emit(event: string, data?: any) {
    this.eventEmitter.emit(event, data);
  }
} 