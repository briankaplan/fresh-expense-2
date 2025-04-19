import React from 'react';
import { Transaction } from '@fresh-expense/types';
interface TransactionListProps {
    transactions: Transaction[];
    loading: boolean;
    onEdit: (transaction: Transaction, field: keyof Transaction, value: any) => Promise<void>;
    onReceiptClick: (transaction: Transaction) => void;
    onAICategorize: (transaction: Transaction) => void;
}
export declare function TransactionList({ transactions, loading, onEdit, onReceiptClick, onAICategorize, }: TransactionListProps): React.JSX.Element;
export {};
//# sourceMappingURL=TransactionList.d.ts.map