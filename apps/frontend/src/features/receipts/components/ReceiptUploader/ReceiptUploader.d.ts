import type React from "react";
interface ReceiptUploaderProps {
  onUploadComplete?: (receipts: Receipt[]) => void;
  company?: string;
}
interface Receipt {
  id: string;
  filename: string;
  status: "processing" | "completed" | "failed";
  transactionId?: string;
  url?: string;
  uploadedAt: string;
}
export declare function ReceiptUploader({
  onUploadComplete,
  company,
}: ReceiptUploaderProps): React.JSX.Element;
//# sourceMappingURL=ReceiptUploader.d.ts.map
