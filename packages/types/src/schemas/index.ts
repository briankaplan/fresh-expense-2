// Base schemas
export * from './base.schema';

// Core schemas
export * from './user.schema';
export * from './merchant.schema';
export * from './expense.schema';
export * from './transaction.schema';
export * from './receipt.schema';
export * from './category.schema';
export * from './budget.schema';

// Integration schemas
export {
  SendgridDocument,
  Sendgrid,
  SendGridAttachment,
  SendGridMetadata
} from './sendgrid.schema';

export * from './integration.schema';

// AI and OCR schemas
export * from './ocr.schema';
export * from './ai-model.schema';

// Analytics and reporting schemas
export * from './analytics.schema';
export * from './report.schema';
export * from './search.schema';

// System schemas
export * from './notification.schema';
export * from './settings.schema';
export * from './subscription.schema';

// Transaction types
export { TransactionLocation, TransactionMetadata } from './lib/transaction-types';
