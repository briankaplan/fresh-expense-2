import React from 'react';
interface ReceiptViewerProps {
    receipt: Receipt;
    onLinkTransaction?: (receiptId: string, transactionId: string) => Promise<void>;
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
export declare function ReceiptViewer({ receipt, onLinkTransaction }: ReceiptViewerProps): React.JSX.Element;
export {};
//# sourceMappingURL=ReceiptViewer.d.ts.map