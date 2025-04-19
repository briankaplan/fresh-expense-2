interface UseReceiptUploadResult {
    uploading: boolean;
    uploadError: Error | null;
    uploadReceipt: (file: File) => Promise<void>;
}
export declare const useReceiptUpload: () => UseReceiptUploadResult;
export {};
//# sourceMappingURL=useReceiptUpload.d.ts.map