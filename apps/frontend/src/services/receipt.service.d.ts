import type { Receipt } from "@fresh-expense/types";
export declare class ReceiptService {
  static uploadReceipt(transactionId: string, file: File): Promise<Receipt>;
  static getReceipt(transactionId: string): Promise<Receipt>;
  static deleteReceipt(transactionId: string): Promise<void>;
  static downloadReceipt(receiptId: string): Promise<Blob>;
  static updateReceipt(receiptId: string, updates: Partial<Receipt>): Promise<Receipt>;
  static linkTransaction(receiptId: string, transactionId: string): Promise<Receipt>;
  static unlinkTransaction(receiptId: string): Promise<Receipt>;
}
//# sourceMappingURL=receipt.service.d.ts.map
