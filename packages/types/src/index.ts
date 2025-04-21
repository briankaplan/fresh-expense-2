// Base types and enums
export * from "./lib/enums";

// Feature-specific exports
export type { ExpenseDocument } from "./expense/expense.schema";
export { ExpenseSchema, Expense } from "./expense/expense.schema";

export * from "./expense/index";
export * from "./merchant/index";
export * from "./metrics/index";

// Common types and interfaces
export * from "./interfaces/index";
export * from "./dto/index";
export * from "./constants/index";
export * from "./services/index";

// Document and Schema exports
export type { ReceiptDocument } from "./schemas/receipt.schema";
export { ReceiptSchema, Receipt } from "./schemas/receipt.schema";

export type { TransactionDocument } from "./schemas/transaction.schema";
export { TransactionSchema, Transaction } from "./schemas/transaction.schema";
export type { Transaction as ITransaction } from "./interfaces/transaction.interface";

export type { MerchantDocument } from "./schemas/merchant.schema";
export { MerchantSchema, Merchant } from "./schemas/merchant.schema";

export type { UserDocument } from "./schemas/user.schema";
export { UserSchema, User } from "./schemas/user.schema";
export type { User as IUser } from "./lib/types";

export type { CategoryDocument } from "./schemas/category.schema";
export { CategorySchema, Category } from "./schemas/category.schema";

export type { BudgetDocument } from "./schemas/budget.schema";
export { BudgetSchema, Budget } from "./schemas/budget.schema";

export type { ReportDocument } from "./schemas/report.schema";
export { ReportSchema, Report } from "./schemas/report.schema";

export type { SubscriptionDocument } from "./schemas/subscription.schema";
export { SubscriptionSchema, Subscription } from "./schemas/subscription.schema";

export type { AnalyticsDocument } from "./schemas/analytics.schema";
export { AnalyticsSchema, Analytics } from "./schemas/analytics.schema";

export type { SearchDocument } from "./schemas/search.schema";
export { SearchSchema, Search } from "./schemas/search.schema";

export type { AIModelDocument } from "./schemas/ai-model.schema";
export { AIModelSchema, AIModel } from "./schemas/ai-model.schema";

export type { OcrDocument } from "./schemas/ocr.schema";
export { OcrSchema, OCR } from "./schemas/ocr.schema";

export type { IntegrationDocument } from "./schemas/integration.schema";
export { IntegrationSchema, Integration } from "./schemas/integration.schema";

export type { SettingsDocument } from "./schemas/settings.schema";
export { SettingsSchema, Settings } from "./schemas/settings.schema";

export type { SendgridDocument } from "./schemas/sendgrid.schema";
export { SendgridSchema, Sendgrid } from "./schemas/sendgrid.schema";

// Additional type exports
export type {
  ReceiptMetadata,
  ReceiptMatchResult,
  ReceiptProcessingOptions,
  ReceiptProcessingResult,
} from "./receipt.types";

export type {
  TellerAccount,
  TellerTransaction,
  TellerError,
  TellerPagination,
  TellerResponseMetadata,
  TellerInstitution,
  TellerEnrollment,
  TellerQuery,
} from "./teller.types";

export { TELLER_TRANSACTION_TYPE_MAP, TELLER_STATUS_MAP } from "./teller.types";

// Export enums and types
export type {
  UserRole,
  UserStatus,
  ExpenseStatus,
  ExpenseCategory,
  Amount,
  Metadata,
  UserSettings,
  ApiError,
  ApiResponse,
  PaginatedResponse,
  SortOptions,
  FilterOptions,
  TellerTransactionToTransaction,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "./lib/types";

// Company types
export type { ICompany, CompanyOwned as CompanyOwnedInterface } from "./interfaces/company.interface";
export * from "./schemas/company.schema";
