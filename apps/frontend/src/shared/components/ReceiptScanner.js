"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptScanner = void 0;
const react_1 = __importStar(require("react"));
require("./ReceiptScanner.css");
const notistack_1 = require("notistack");
const ReceiptScanner = ({ onScanComplete }) => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    const [image, setImage] = (0, react_1.useState)(null);
    const [result, setResult] = (0, react_1.useState)(null);
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                setImage(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleScan = async () => {
        if (!image) {
            enqueueSnackbar('No image selected', { variant: 'warning' });
            return;
        }
        setIsLoading(true);
        try {
            // First, classify if it's a receipt
            const formData = new FormData();
            formData.append('file', new Blob([Buffer.from(image.split(',')[1], 'base64')]), 'receipt.jpg');
            const classifyResponse = await fetch('/api/ai/classify-receipt', {
                method: 'POST',
                body: formData,
            });
            const { isReceipt, confidence } = await classifyResponse.json();
            if (!isReceipt) {
                enqueueSnackbar("This doesn't appear to be a receipt", { variant: 'warning' });
                return;
            }
            // Extract information from the receipt
            const extractResponse = await fetch('/api/ai/extract-info', {
                method: 'POST',
                body: formData,
            });
            const extractedData = await extractResponse.json();
            onScanComplete({
                file: new Blob([Buffer.from(image.split(',')[1], 'base64')]),
                extractedData,
                confidence,
            });
            enqueueSnackbar('Receipt scanned successfully', { variant: 'success' });
        }
        catch (error) {
            enqueueSnackbar('Error scanning receipt', { variant: 'error' });
            console.error('Error scanning receipt:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="receipt-scanner-container">
      <h1 className="receipt-scanner-title">Receipt Scanner</h1>

      <div className="receipt-scanner-upload">
        <label htmlFor="receipt-upload" className="receipt-scanner-upload-label">
          Upload Receipt Image
          <input id="receipt-upload" type="file" accept="image/*" onChange={handleImageUpload} aria-label="Upload receipt image" className="receipt-scanner-upload-input"/>
        </label>
      </div>

      {image && <img src={image} alt="Receipt preview" className="receipt-scanner-preview"/>}

      <button className="receipt-scanner-button" onClick={handleScan} disabled={!image || isLoading}>
        {isLoading ? 'Scanning...' : 'Scan Receipt'}
      </button>

      {result && <div className="receipt-scanner-result">{result}</div>}
    </div>);
};
exports.ReceiptScanner = ReceiptScanner;
exports.default = exports.ReceiptScanner;
//# sourceMappingURL=ReceiptScanner.js.map