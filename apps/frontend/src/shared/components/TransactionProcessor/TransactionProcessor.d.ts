import type { Transaction } from "@fresh-expense/types";
import type { TransactionStatus } from "@fresh-expense/types";
import type React from "react";
interface TransactionProcessorProps {
  transaction: Transaction & {
    status: TransactionStatus;
  };
  onProcessingComplete?: (updatedTransaction: Transaction) => void;
  onError?: (error: Error) => void;
}
export declare const TransactionProcessor: React.FC<TransactionProcessorProps>;
//# sourceMappingURL=TransactionProcessor.d.ts.map
