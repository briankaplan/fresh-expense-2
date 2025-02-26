import { SystemBootstrap } from './SystemBootstrap';
import { AppError, ErrorCodes } from '../utils/error';
import { AppConfig } from '../config';

export class InitSystem {
  static async start(): Promise<void> {
    try {
      console.log('Starting system initialization...');
      
      // Initialize system bootstrap
      const bootstrap = SystemBootstrap.getInstance();
      await bootstrap.initialize();

      // Additional initialization steps
      await this.initializeEnvironment();
      
      console.log('System initialization complete');
    } catch (error) {
      console.error('System initialization failed:', error);
      throw new AppError(
        'System initialization failed',
        ErrorCodes.VALIDATION_ERROR,
        error
      );
    }
  }

  private static async initializeEnvironment(): Promise<void> {
    // Set up environment-specific configurations
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode');
    }

    // Validate required environment variables
    this.validateEnvironment();
  }

  private static validateEnvironment(): void {
    const requiredVars = ['HIBP_API_KEY'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new AppError(
        `Missing required environment variables: ${missing.join(', ')}`,
        ErrorCodes.VALIDATION_ERROR
      );
    }
  }
} 