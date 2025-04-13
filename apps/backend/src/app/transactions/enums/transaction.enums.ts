export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer'
}

export enum TransactionStatus {
  PENDING = 'pending',
  POSTED = 'posted',
  CANCELLED = 'cancelled'
}

export enum TransactionProcessingStatus {
  PROCESSED = 'processed',
  PENDING = 'pending',
  FAILED = 'failed'
}

export enum TransactionSource {
  TELLER = 'teller',
  CSV_IMPORT = 'csv_import',
  RECEIPT = 'receipt',
  MANUAL = 'manual'
}

export enum TransactionCompany {
  DOWN_HOME = 'Down Home',
  MUSIC_CITY_RODEO = 'Music City Rodeo',
  PERSONAL = 'Personal'
}

export enum TransactionPaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  OTHER = 'other'
}

export enum TransactionPaymentProcessor {
  APPLE = 'apple',
  GOOGLE = 'google',
  OTHER = 'other'
}

export enum TransactionReimbursementStatus {
  NOT_REIMBURSABLE = 'not_reimbursable',
  PENDING = 'pending',
  REIMBURSED = 'reimbursed',
  DENIED = 'denied'
} 