const config = {
  environment: process.env.NODE_ENV || 'development',
  
  database: {
    name: 'password_manager_db',
    version: 1,
    stores: ['accounts', 'passwords', 'settings']
  },

  security: {
    encryption: {
      algorithm: 'AES-GCM',
      keyLength: 256
    },
    authentication: {
      sessionTimeout: 1800000, // 30 minutes
      maxAttempts: 3
    }
  },

  automation: {
    maxRetries: 3,
    timeout: 30000,
    concurrency: 2
  },

  ui: {
    theme: 'light',
    animations: true,
    notificationDuration: 5000
  }
};

export default config; 