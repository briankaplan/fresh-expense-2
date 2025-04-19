import type { Receipt } from "@fresh-expense/types";
import type React from "react";
interface ReceiptDetailsProps {
  receipt: Receipt;
  open: boolean;
  onClose: () => void;
  onUpdate: (receipt: Receipt) => void;
}
export declare const ReceiptDetails: React.FC<ReceiptDetailsProps>;
//# sourceMappingURL=ReceiptDetails.d.ts.map
