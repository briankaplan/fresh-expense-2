import React from 'react';
import { Receipt } from '@fresh-expense/types';
interface ReceiptDetailsProps {
    receipt: Receipt;
    open: boolean;
    onClose: () => void;
    onUpdate: (receipt: Receipt) => void;
}
export declare const ReceiptDetails: React.FC<ReceiptDetailsProps>;
export {};
//# sourceMappingURL=ReceiptDetails.d.ts.map