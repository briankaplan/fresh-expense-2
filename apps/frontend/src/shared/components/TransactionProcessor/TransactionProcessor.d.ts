import React from 'react';
import { Transaction } from '@fresh-expense/types';
import { TransactionStatus } from '@fresh-expense/types';
interface TransactionProcessorProps {
    transaction: Transaction & {
        status: TransactionStatus;
    };
    onProcessingComplete?: (updatedTransaction: Transaction) => void;
    onError?: (error: Error) => void;
}
export declare const TransactionProcessor: React.FC<TransactionProcessorProps>;
export {};
//# sourceMappingURL=TransactionProcessor.d.ts.map