interface Merchant extends Record<string, unknown> {
    id: string;
    name: string;
    category: string;
    transactionCount: number;
    lastTransactionDate: string;
}
interface MerchantListProps {
    merchants: Merchant[];
    onAddMerchant?: () => void;
    onEditMerchant?: (merchant: Merchant) => void;
}
export declare function MerchantList({ merchants, onAddMerchant, onEditMerchant }: MerchantListProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MerchantList.d.ts.map