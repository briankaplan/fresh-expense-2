import { useCallback, useState } from "react";

interface UseReceiptNormalizationResult {
  normalizing: boolean;
  normalizeError: Error | null;
  normalizeReceipt: (ocrData: any) => Promise<void>;
}

export const useReceiptNormalization = (): UseReceiptNormalizationResult => {
  const [normalizing, setNormalizing] = useState(false);
  const [normalizeError, setNormalizeError] = useState<Error | null>(null);

  const normalizeReceipt = useCallback(async (ocrData: any) => {
    setNormalizing(true);
    setNormalizeError(null);
    try {
      // Implement normalization logic here using ocrData
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock normalization
    } catch (error) {
      setNormalizeError(error as Error);
      throw error;
    } finally {
      setNormalizing(false);
    }
  }, []);

  return { normalizing, normalizeError, normalizeReceipt };
};
