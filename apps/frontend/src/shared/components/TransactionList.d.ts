import type React from "react";
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
}
interface TransactionListProps {
  transactions: Transaction[];
}
export declare const TransactionList: React.FC<TransactionListProps>;
//# sourceMappingURL=TransactionList.d.ts.map
