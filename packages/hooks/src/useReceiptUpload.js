"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useReceiptUpload = void 0;
const react_1 = require("react");
const useReceiptUpload = () => {
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [uploadError, setUploadError] = (0, react_1.useState)(null);
    const uploadReceipt = (0, react_1.useCallback)(async (file) => {
        setUploading(true);
        setUploadError(null);
        try {
            // Implement file upload logic here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock upload
        }
        catch (error) {
            setUploadError(error);
            throw error;
        }
        finally {
            setUploading(false);
        }
    }, []);
    return { uploading, uploadError, uploadReceipt };
};
exports.useReceiptUpload = useReceiptUpload;
//# sourceMappingURL=useReceiptUpload.js.map