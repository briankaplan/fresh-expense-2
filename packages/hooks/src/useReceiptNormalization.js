Object.defineProperty(exports, "__esModule", { value: true });
exports.useReceiptNormalization = void 0;
const react_1 = require("react");
const useReceiptNormalization = () => {
  const [normalizing, setNormalizing] = (0, react_1.useState)(false);
  const [normalizeError, setNormalizeError] = (0, react_1.useState)(null);
  const normalizeReceipt = (0, react_1.useCallback)(async (ocrData) => {
    setNormalizing(true);
    setNormalizeError(null);
    try {
      // Implement normalization logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock normalization
    } catch (error) {
      setNormalizeError(error);
      throw error;
    } finally {
      setNormalizing(false);
    }
  }, []);
  return { normalizing, normalizeError, normalizeReceipt };
};
exports.useReceiptNormalization = useReceiptNormalization;
//# sourceMappingURL=useReceiptNormalization.js.map
