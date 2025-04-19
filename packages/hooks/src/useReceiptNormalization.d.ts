interface UseReceiptNormalizationResult {
    normalizing: boolean;
    normalizeError: Error | null;
    normalizeReceipt: (ocrData: unknown) => Promise<void>;
}
export declare const useReceiptNormalization: () => UseReceiptNormalizationResult;
export {};
//# sourceMappingURL=useReceiptNormalization.d.ts.map