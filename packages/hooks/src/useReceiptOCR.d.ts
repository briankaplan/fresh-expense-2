interface UseReceiptOCRResult {
    processing: boolean;
    processingError: Error | null;
    processReceipt: (receiptUrl: string) => Promise<void>;
}
export declare const useReceiptOCR: () => UseReceiptOCRResult;
export {};
//# sourceMappingURL=useReceiptOCR.d.ts.map