/**
 * Types for Teller API integration
 * @see https://teller.io/docs/api
 */

import type { User } from "./interfaces/user.interface";

/**
 * Represents a bank account from Teller API
 */
export interface TellerAccount {
  id: string;
  institution: {
    id: string;
    name: string;
  };
  type: string;
  subtype: string;
  name: string;
  currency: string;
  status: string;
  last_four: string;
  balances: {
    available: number;
    current: number;
    ledger: number;
  };
  enrollment: {
    id: string;
    institution_id: string;
  };
}

/**
 * Represents a transaction from Teller API
 */
export interface TellerTransaction {
  id: string;
  accountId: string;
  date: Date;
  description: {
    original: string;
    clean?: string;
    simple?: string;
  };
  amount: {
    value: number;
    currency: string;
  };
  running_balance?: {
    value: number;
    currency: string;
  };
  type: "debit" | "credit";
  status: "pending" | "posted" | "canceled" | "matched";
  merchant?: {
    name: string;
    category?: string;
    website?: string;
  };
  enrichment?: {
    category?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
      latitude?: number;
      longitude?: number;
    };
    paymentMethod?: string;
  };
}

/**
 * Maps Teller transaction types to our internal transaction types
 */
export const TELLER_TRANSACTION_TYPE_MAP = {
  debit: "expense",
  credit: "income",
} as const;

/**
 * Maps Teller transaction status to our internal status
 */
export const TELLER_STATUS_MAP = {
  pending: "pending",
  posted: "completed",
  cancelled: "cancelled",
} as const;

/**
 * Type for Teller API error responses
 */
export interface TellerError {
  error: {
    code: string;
    message: string;
    type: string;
  };
}

/**
 * Type for Teller API pagination
 */
export interface TellerPagination {
  has_more: boolean;
  before_cursor?: string;
  after_cursor?: string;
}

/**
 * Type for Teller API response metadata
 */
export interface TellerResponseMetadata {
  request_id: string;
  timestamp: string;
  pagination?: TellerPagination;
}

export interface TellerInstitution {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
}

export interface TellerEnrollment {
  id: string;
  institution_id: string;
  institution: {
    name: string;
    id: string;
  };
  status: string;
  accounts: TellerAccount[];
}

export interface Column {
  field: string;
  header: string;
  type?: "text" | "number" | "date" | "currency";
  format?: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}

export interface ExtendedUser extends Omit<User, "settings"> {
  permissions: string[];
  settings: Record<string, any>;
  lastLogin?: Date;
}

export interface TellerQuery {
  from?: string;
  to?: string;
  count?: number;
  offset?: number;
}
