import React from 'react';
interface MatchingPreferences {
    weights: {
        merchant: number;
        amount: number;
        date: number;
        location: number;
        category: number;
        paymentMethod: number;
        text: number;
    };
    amountTolerance: number;
    dateRangeDays: number;
    merchantMatchThreshold: number;
}
interface ReceiptMatchingPreferencesProps {
    onSave: (preferences: MatchingPreferences) => void;
    initialPreferences?: MatchingPreferences;
}
export declare const ReceiptMatchingPreferences: React.FC<ReceiptMatchingPreferencesProps>;
export {};
//# sourceMappingURL=ReceiptMatchingPreferences.d.ts.map