import type { TellerTransaction } from "../teller.types";

export interface TellerTransactionFilters {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  status?: TellerTransaction["status"];
  type?: TellerTransaction["type"];
}

export interface TellerTransactionSummary {
  total: number;
  count: number;
  byType: Record<
    string,
    {
      total: number;
      count: number;
    }
  >;
  byStatus: Record<
    string,
    {
      total: number;
      count: number;
    }
  >;
}

export interface TellerTransactionSync {
  accountId: string;
  lastSync: Date;
  nextSync: Date;
  status: "pending" | "syncing" | "completed" | "failed";
  error?: string;
  stats: {
    added: number;
    updated: number;
    deleted: number;
    total: number;
  };
}
