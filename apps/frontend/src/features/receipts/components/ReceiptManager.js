const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptManager = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const receipt_service_1 = require("../../../../services/receipt.service");
const react_toastify_1 = require("react-toastify");
const ReceiptManager = ({ transactionId, onReceiptChange }) => {
  const [receipt, setReceipt] = (0, react_1.useState)(null);
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [previewOpen, setPreviewOpen] = (0, react_1.useState)(false);
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const uploadedReceipt = await receipt_service_1.ReceiptService.uploadReceipt(
        transactionId,
        file,
      );
      setReceipt(uploadedReceipt);
      onReceiptChange?.(uploadedReceipt);
      react_toastify_1.toast.success("Receipt uploaded successfully");
    } catch (error) {
      react_toastify_1.toast.error("Failed to upload receipt");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    try {
      setLoading(true);
      await receipt_service_1.ReceiptService.deleteReceipt(transactionId);
      setReceipt(null);
      onReceiptChange?.(null);
      react_toastify_1.toast.success("Receipt deleted successfully");
    } catch (error) {
      react_toastify_1.toast.error("Failed to delete receipt");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handlePreview = async () => {
    if (!receipt) {
      try {
        setLoading(true);
        const fetchedReceipt = await receipt_service_1.ReceiptService.getReceipt(transactionId);
        setReceipt(fetchedReceipt);
        setPreviewOpen(true);
      } catch (error) {
        react_toastify_1.toast.error("Failed to fetch receipt");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setPreviewOpen(true);
    }
  };
  return (
    <material_1.Box display="flex" alignItems="center" gap={1}>
      <input
        accept="image/*,.pdf"
        style={{ display: "none" }}
        id={`receipt-upload-${transactionId}`}
        type="file"
        onChange={handleFileUpload}
        disabled={loading}
      />
      <label htmlFor={`receipt-upload-${transactionId}`}>
        <material_1.Button
          variant="outlined"
          component="span"
          startIcon={<icons_material_1.CloudUpload />}
          disabled={loading}
        >
          Upload Receipt
        </material_1.Button>
      </label>

      {receipt && (
        <>
          <material_1.IconButton onClick={handlePreview} disabled={loading}>
            <icons_material_1.Visibility />
          </material_1.IconButton>
          <material_1.IconButton onClick={handleDelete} disabled={loading}>
            <icons_material_1.Delete />
          </material_1.IconButton>
        </>
      )}

      <material_1.Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <material_1.DialogTitle>Receipt Preview</material_1.DialogTitle>
        <material_1.DialogContent>
          {receipt && (
            <material_1.Box
              component="img"
              src={receipt.url}
              alt="Receipt"
              sx={{ width: "100%", height: "auto" }}
            />
          )}
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setPreviewOpen(false)}>Close</material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>
  );
};
exports.ReceiptManager = ReceiptManager;
//# sourceMappingURL=ReceiptManager.js.map
