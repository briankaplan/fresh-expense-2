export class InitSystem {
  constructor() {
    this.config = null;
    this.environment = process.env.NODE_ENV || 'development';
  }

  async bootstrap() {
    try {
      // Load configuration
      this.config = await this.loadConfig();
      
      // Initialize core systems
      await this.initializeCrypto();
      await this.checkCompatibility();
      await this.setupLogging();
      
      // Create application instance
      const app = new Application();
      await app.initialize();
      
      return app;
    } catch (error) {
      console.error('System initialization failed:', error);
      throw error;
    }
  }

  async loadConfig() {
    const config = await import(`../config/${this.environment}.js`);
    return config.default;
  }

  async initializeCrypto() {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Secure cryptography is not available');
    }
  }

  async checkCompatibility() {
    const requirements = [
      'localStorage',
      'indexedDB',
      'Proxy',
      'Promise',
      'Map',
      'Set'
    ];

    const missing = requirements.filter(req => !(req in window));
    if (missing.length > 0) {
      throw new Error(`Missing required features: ${missing.join(', ')}`);
    }
  }

  async setupLogging() {
    // Configure logging based on environment
    if (this.environment === 'development') {
      console.log('🔧 Development mode enabled');
    } else {
      // Disable console in production
      console.log = () => {};
      console.debug = () => {};
    }
  }
} 