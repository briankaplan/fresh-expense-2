import React from 'react';
import { Merchant } from '@fresh-expense/types';
export interface Merchant {
    id: string;
    name: string;
    category: string;
    totalSpent: number;
    transactionCount: number;
    lastTransactionDate: string;
}
interface MerchantListProps {
    merchants: Merchant[];
    loading?: boolean;
    onMerchantClick?: (merchant: Merchant) => void;
}
export declare function MerchantList({ merchants, loading, onMerchantClick }: MerchantListProps): React.JSX.Element;
export {};
//# sourceMappingURL=MerchantList.d.ts.map