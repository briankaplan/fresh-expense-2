// Base types and enums
export * from "./lib/enums";

// Feature-specific exports
export {
  ExpenseDocument,
  ExpenseSchema,
  Expense,
} from "./expense/expense.schema";

export * from "./expense/index";
export * from "./merchant/index";
export * from "./metrics/index";

// Common types and interfaces
export * from "./interfaces/index";
export * from "./dto/index";
export * from "./constants/index";
export * from "./services/index";

// Document and Schema exports
export {
  ReceiptDocument,
  ReceiptSchema,
  Receipt,
} from "./schemas/receipt.schema";

export {
  TransactionDocument,
  TransactionSchema,
  Transaction as TransactionModel,
} from "./schemas/transaction.schema";

export {
  MerchantDocument,
  MerchantSchema,
  Merchant,
} from "./schemas/merchant.schema";

export {
  UserDocument,
  UserSchema,
  User as UserModel,
} from "./schemas/user.schema";

export {
  CategoryDocument,
  CategorySchema,
  Category,
} from "./schemas/category.schema";

export {
  BudgetDocument,
  BudgetSchema,
  Budget,
} from "./schemas/budget.schema";

export {
  ReportDocument,
  ReportSchema,
  Report,
} from "./schemas/report.schema";

export {
  SubscriptionDocument,
  SubscriptionSchema,
  Subscription,
} from "./schemas/subscription.schema";

export {
  AnalyticsDocument,
  AnalyticsSchema,
  Analytics,
} from "./schemas/analytics.schema";

export {
  SearchDocument,
  SearchSchema,
  Search,
} from "./schemas/search.schema";

export {
  AIModelDocument,
  AIModelSchema,
  AIModel,
} from "./schemas/ai-model.schema";

export {
  OcrDocument,
  OcrSchema,
  OCR,
} from "./schemas/ocr.schema";

export {
  IntegrationDocument,
  IntegrationSchema,
  Integration,
} from "./schemas/integration.schema";

export {
  SettingsDocument,
  SettingsSchema,
  Settings,
} from "./schemas/settings.schema";

export {
  SendgridDocument,
  SendgridSchema,
  Sendgrid,
} from "./schemas/sendgrid.schema";

export {
  TwilioDocument,
  TwilioSchema,
  Twilio,
} from "./schemas/twilio.schema";

// Additional type exports
export {
  ReceiptMetadata,
  ReceiptMatchResult,
  ReceiptProcessingOptions,
  ReceiptProcessingResult,
} from "./receipt.types";

export {
  TellerAccount,
  TellerTransaction,
  TellerError,
  TellerPagination,
  TellerResponseMetadata,
  TellerInstitution,
  TellerEnrollment,
  TellerQuery,
  TELLER_TRANSACTION_TYPE_MAP,
  TELLER_STATUS_MAP,
} from "./teller.types";

// Export enums and types
export {
  UserRole,
  UserStatus,
  ExpenseStatus,
  ExpenseCategory,
  Amount,
  Metadata,
  User,
  UserSettings,
  Transaction,
  ApiError,
  ApiResponse,
  PaginatedResponse,
  SortOptions,
  FilterOptions,
  TellerTransactionToTransaction,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "./lib/types";
