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
const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptUpload = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const react_dropzone_1 = require("react-dropzone");
const api_1 = __importDefault(require("../../services/api"));
const ReceiptUpload = ({ onSuccess, onCancel, transactionId }) => {
  const [file, setFile] = (0, react_1.useState)(null);
  const [merchant, setMerchant] = (0, react_1.useState)("");
  const [amount, setAmount] = (0, react_1.useState)("");
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [error, setError] = (0, react_1.useState)("");
  const [preview, setPreview] = (0, react_1.useState)(null);
  const onDrop = (0, react_1.useCallback)((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !merchant || !amount) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("merchant", merchant);
      formData.append("amount", amount);
      if (transactionId) {
        formData.append("transactionId", transactionId);
      }
      const response = await api_1.default.post("/receipts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onSuccess(response.data);
    } catch (err) {
      setError("Failed to upload receipt. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <material_1.DialogTitle>Upload Receipt</material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <material_1.Box
            {...getRootProps()}
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "grey.300",
              borderRadius: 1,
              p: 3,
              mb: 3,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            <input {...getInputProps()} />
            {preview ? (
              <material_1.Box
                component="img"
                src={preview}
                alt="Receipt preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 200,
                  objectFit: "contain",
                }}
              />
            ) : (
              <material_1.Typography>
                {isDragActive
                  ? "Drop the receipt here"
                  : "Drag and drop a receipt, or click to select"}
              </material_1.Typography>
            )}
          </material_1.Box>

          <material_1.TextField
            fullWidth
            label="Merchant"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            margin="normal"
            required
          />

          <material_1.TextField
            fullWidth
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            required
            type="number"
            inputProps={{ step: "0.01" }}
          />

          {error && (
            <material_1.Typography color="error" sx={{ mt: 2 }}>
              {error}
            </material_1.Typography>
          )}
        </material_1.Box>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={onCancel}>Cancel</material_1.Button>
        <material_1.Button onClick={handleSubmit} variant="contained" disabled={loading || !file}>
          {loading ? <material_1.CircularProgress size={24} /> : "Upload"}
        </material_1.Button>
      </material_1.DialogActions>
    </>
  );
};
exports.ReceiptUpload = ReceiptUpload;
//# sourceMappingURL=ReceiptUpload.js.map
