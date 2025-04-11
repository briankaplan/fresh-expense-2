import { useState, useCallback } from 'react';

interface UseReceiptOCRResult {
  processing: boolean;
  processingError: Error | null;
  processReceipt: (receiptUrl: string) => Promise<void>;
}

export const useReceiptOCR = (): UseReceiptOCRResult => {
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<Error | null>(null);

  const processReceipt = useCallback(async (receiptUrl: string) => {
    setProcessing(true);
    setProcessingError(null);
    try {
      // Implement OCR processing logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock processing
    } catch (error) {
      setProcessingError(error as Error);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);

  return { processing, processingError, processReceipt };
}; 