import { useState, useCallback } from 'react';

interface UseReceiptUploadResult {
  uploading: boolean;
  uploadError: Error | null;
  uploadReceipt: (file: File) => Promise<void>;
}

export const useReceiptUpload = (): UseReceiptUploadResult => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const uploadReceipt = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      // Implement file upload logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock upload
    } catch (error) {
      setUploadError(error as Error);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, uploadError, uploadReceipt };
};
