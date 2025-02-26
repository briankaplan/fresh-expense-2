export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  DELETED: 'deleted',
  SKIPPED: 'skipped'
} as const;

export const CONFIG = {
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

  batch: {
    maxRetries: 3,
    timeout: 30000,
    concurrency: 2
  }
}; 