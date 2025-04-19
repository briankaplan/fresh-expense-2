var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
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
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptViewer = ReceiptViewer;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_hot_toast_1 = require("react-hot-toast");
function ReceiptViewer({ receipt, onLinkTransaction }) {
  const [scale, setScale] = (0, react_1.useState)(1);
  const [rotation, setRotation] = (0, react_1.useState)(0);
  const [isLoading, setIsLoading] = (0, react_1.useState)(false);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
  const handleRotateLeft = () => setRotation((prev) => (prev - 90) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleDownload = async () => {
    if (!receipt.url) return;
    try {
      const response = await fetch(receipt.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = receipt.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      react_hot_toast_1.toast.error("Failed to download receipt");
    }
  };
  const handleLinkTransaction = async (transactionId) => {
    if (!onLinkTransaction) return;
    try {
      setIsLoading(true);
      await onLinkTransaction(receipt.id, transactionId);
      react_hot_toast_1.toast.success("Receipt linked to transaction");
    } catch (error) {
      console.error("Error linking receipt:", error);
      react_hot_toast_1.toast.error("Failed to link receipt to transaction");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <material_1.Paper sx={{ p: 2 }}>
      <material_1.Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <material_1.Typography variant="h6">{receipt.filename}</material_1.Typography>
        <material_1.Box sx={{ display: "flex", gap: 1 }}>
          <material_1.Chip
            label={receipt.status}
            color={
              receipt.status != null ? "success" : receipt.status != null ? "warning" : "error"
            }
            size="small"
          />
          {receipt.transactionId && (
            <material_1.Chip
              icon={<icons_material_1.Link />}
              label="Linked"
              color="primary"
              size="small"
            />
          )}
        </material_1.Box>
      </material_1.Box>

      {receipt.status != null ? (
        <material_1.Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            p: 4,
          }}
        >
          <icons_material_1.Error color="error" sx={{ fontSize: 48 }} />
          <material_1.Typography color="error">
            Failed to process receipt. Please try uploading again.
          </material_1.Typography>
        </material_1.Box>
      ) : receipt.status != null ? (
        <material_1.Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            p: 4,
          }}
        >
          <material_1.CircularProgress />
          <material_1.Typography>Processing receipt...</material_1.Typography>
        </material_1.Box>
      ) : (
        <>
          <material_1.Box
            sx={{
              position: "relative",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              mb: 2,
            }}
          >
            <material_1.Box
              component="img"
              src={receipt.url}
              alt={receipt.filename}
              sx={{
                width: "100%",
                height: "auto",
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: "transform 0.2s",
              }}
            />
          </material_1.Box>

          <material_1.Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <material_1.Box sx={{ display: "flex", gap: 1 }}>
              <material_1.Tooltip title="Zoom In">
                <material_1.IconButton onClick={handleZoomIn} size="small">
                  <icons_material_1.ZoomIn />
                </material_1.IconButton>
              </material_1.Tooltip>
              <material_1.Tooltip title="Zoom Out">
                <material_1.IconButton onClick={handleZoomOut} size="small">
                  <icons_material_1.ZoomOut />
                </material_1.IconButton>
              </material_1.Tooltip>
              <material_1.Tooltip title="Rotate Left">
                <material_1.IconButton onClick={handleRotateLeft} size="small">
                  <icons_material_1.RotateLeft />
                </material_1.IconButton>
              </material_1.Tooltip>
              <material_1.Tooltip title="Rotate Right">
                <material_1.IconButton onClick={handleRotateRight} size="small">
                  <icons_material_1.RotateRight />
                </material_1.IconButton>
              </material_1.Tooltip>
            </material_1.Box>
            <material_1.Tooltip title="Download">
              <material_1.IconButton onClick={handleDownload} size="small">
                <icons_material_1.Download />
              </material_1.IconButton>
            </material_1.Tooltip>
          </material_1.Box>

          {receipt.metadata && (
            <material_1.Box sx={{ mt: 2 }}>
              <material_1.Typography variant="subtitle2" gutterBottom>
                Extracted Information
              </material_1.Typography>
              <material_1.Box sx={{ display: "flex", gap: 2 }}>
                {receipt.metadata.date && (
                  <material_1.Typography variant="body2">
                    Date: {new Date(receipt.metadata.date).toLocaleDateString()}
                  </material_1.Typography>
                )}
                {receipt.metadata.amount && (
                  <material_1.Typography variant="body2">
                    Amount: ${receipt.metadata.amount.toFixed(2)}
                  </material_1.Typography>
                )}
                {receipt.metadata.merchant && (
                  <material_1.Typography variant="body2">
                    Merchant: {receipt.metadata.merchant}
                  </material_1.Typography>
                )}
              </material_1.Box>
            </material_1.Box>
          )}
        </>
      )}
    </material_1.Paper>
  );
}
//# sourceMappingURL=ReceiptViewer.js.map
