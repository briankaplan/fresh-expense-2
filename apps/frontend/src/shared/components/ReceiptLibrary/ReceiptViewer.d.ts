import type React from "react";
interface ReceiptViewerProps {
  receiptUrl: string;
  receiptData: {
    merchant: string;
    amount: number;
    date: string;
    filename: string;
  };
  onClose: () => void;
}
export declare const ReceiptViewer: React.FC<ReceiptViewerProps>;
//# sourceMappingURL=ReceiptViewer.d.ts.map
