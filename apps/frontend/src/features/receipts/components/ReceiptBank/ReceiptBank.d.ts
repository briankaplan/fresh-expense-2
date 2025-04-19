import React from 'react';
import { Transaction } from '@fresh-expense/types';
interface ReceiptBankProps {
    company?: string;
    transactions?: Transaction[];
    onReceiptsChange?: (receipts: Receipt[]) => void;
}
interface Receipt {
    id: string;
    filename: string;
    status: 'processing' | 'completed' | 'failed';
    transactionId?: string;
    url?: string;
    uploadedAt: string;
    metadata?: {
        date?: string;
        amount?: number;
        merchant?: string;
    };
}
export declare function ReceiptBank({ company, transactions, onReceiptsChange }: ReceiptBankProps): React.JSX.Element;
export {};
//# sourceMappingURL=ReceiptBank.d.ts.map