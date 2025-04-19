import type { Receipt } from "@fresh-expense/types";
import type React from "react";
interface ReceiptManagerProps {
  transactionId: string;
  onReceiptChange?: (receipt: Receipt | null) => void;
}
export declare const ReceiptManager: React.FC<ReceiptManagerProps>;
//# sourceMappingURL=ReceiptManager.d.ts.map
