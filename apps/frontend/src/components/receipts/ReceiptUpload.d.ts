interface ReceiptUploadProps {
  onUpload: (file: File) => Promise<void>;
  allowedFileTypes?: string[];
  maxFileSize?: number;
}
export declare function ReceiptUpload({
  onUpload,
  allowedFileTypes,
  maxFileSize,
}: ReceiptUploadProps): import("react").JSX.Element;
//# sourceMappingURL=ReceiptUpload.d.ts.map
