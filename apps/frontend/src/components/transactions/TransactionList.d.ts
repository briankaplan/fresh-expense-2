interface Transaction extends Record<string, unknown> {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    merchant: string;
}
interface TransactionListProps {
    transactions: Transaction[];
    onTransactionClick?: (transaction: Transaction) => void;
}
export declare function TransactionList({ transactions, onTransactionClick }: TransactionListProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TransactionList.d.ts.map