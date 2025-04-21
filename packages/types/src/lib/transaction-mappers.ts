// Internal modules
import { ExpenseCategory } from "./enums";
import type { TellerTransactionToTransaction } from "./types";
import type { Transaction } from "../schemas/transaction.schema";
import type { TellerTransaction } from "../teller.types";

/**
 * Validates a TellerTransaction object
 * @param transaction The transaction to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateTellerTransaction(transaction: unknown): string[] {
  const errors: string[] = [];

  if (!transaction || typeof transaction !== "object") {
    return ["Invalid transaction object"];
  }

  const tx = transaction as Partial<TellerTransaction>;

  if (!tx.id) errors.push("Missing transaction ID");
  if (!tx.accountId) errors.push("Missing account ID");
  if (!tx.date) errors.push("Missing date");
  if (!tx.description) errors.push("Missing description");
  if (!tx.amount?.value) errors.push("Missing amount value");
  if (!tx.amount?.currency) errors.push("Missing amount currency");
  if (!tx.type || !["debit", "credit"].includes(tx.type)) errors.push("Invalid transaction type");
  if (!tx.status || !["pending", "posted", "canceled", "matched"].includes(tx.status))
    errors.push("Invalid transaction status");

  return errors;
}

/**
 * Maps a TellerTransaction to our internal Transaction format
 * @param tellerTx The Teller transaction to convert
 * @returns Mapped transaction data ready for creation
 */
export function mapTellerToTransaction(
  tellerTx: TellerTransaction,
): TellerTransactionToTransaction {
  const now = new Date();
  const location = tellerTx.enrichment?.location;
  const coordinates =
    location?.latitude !== undefined && location?.longitude !== undefined
      ? {
        latitude: location.latitude,
        longitude: location.longitude,
      }
      : undefined;

  return {
    accountId: tellerTx.accountId,
    date: new Date(tellerTx.date),
    description: tellerTx.description.original,
    cleanDescription: tellerTx.description.clean || tellerTx.description.original,
    amount: tellerTx.amount,
    runningBalance: tellerTx.running_balance,
    category: tellerTx.enrichment?.category || ExpenseCategory.OTHER,
    merchant: {
      name: tellerTx.merchant?.name || tellerTx.description.original,
      category: tellerTx.merchant?.category || ExpenseCategory.OTHER,
      website: tellerTx.merchant?.website,
    },
    source: "teller" as const,
    status: tellerTx.status,
    type: tellerTx.type === "debit" ? "expense" : "income",
    location: location
      ? {
        address: location.address,
        city: location.city,
        region: location.state,
        country: location.country,
        postalCode: location.postal_code,
        coordinates,
      }
      : undefined,
    metadata: {
      paymentMethod: tellerTx.enrichment?.paymentMethod,
    },
    tellerId: tellerTx.id,
    tellerAccountId: tellerTx.accountId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validates an internal Transaction object
 * @param transaction The transaction to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateTransaction(transaction: unknown): string[] {
  const errors: string[] = [];

  if (!transaction || typeof transaction !== "object") {
    return ["Invalid transaction object"];
  }

  const tx = transaction as Partial<Transaction>;

  if (!tx._id) errors.push("Missing transaction ID");
  if (!tx.userId) errors.push("Missing user ID");
  if (!tx.date) errors.push("Missing date");
  if (!tx.description) errors.push("Missing description");
  if (!tx.amount?.value) errors.push("Missing amount value");
  if (!tx.amount?.currency) errors.push("Missing amount currency");
  if (!tx.merchant?.name) errors.push("Missing merchant name");
  if (!tx.type || !["expense", "income", "transfer"].includes(tx.type)) {
    errors.push("Invalid transaction type");
  }
  if (!tx.status || !["pending", "completed", "failed"].includes(tx.status)) {
    errors.push("Invalid transaction status");
  }
  if (!tx.source || !["teller", "manual", "import"].includes(tx.source)) {
    errors.push("Invalid transaction source");
  }

  return errors;
}

/**
 * Type guard to check if an object is a valid Transaction
 * @param transaction The object to check
 * @returns True if the object is a valid Transaction
 */
export function isTransaction(transaction: unknown): transaction is Transaction {
  return validateTransaction(transaction).length === 0;
}

/**
 * Type guard to check if an object is a valid TellerTransaction
 * @param transaction The object to check
 * @returns True if the object is a valid TellerTransaction
 */
export function isTellerTransaction(transaction: unknown): transaction is TellerTransaction {
  return validateTellerTransaction(transaction).length === 0;
}
