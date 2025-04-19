import React from 'react';
import { Receipt } from '@fresh-expense/types';
interface ReceiptManagerProps {
    transactionId: string;
    onReceiptChange?: (receipt: Receipt | null) => void;
}
export declare const ReceiptManager: React.FC<ReceiptManagerProps>;
export {};
//# sourceMappingURL=ReceiptManager.d.ts.map