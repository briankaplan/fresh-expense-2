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
exports.ReceiptDetails = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const TransactionLinkDialog_1 = require("../ReceiptLibrary/TransactionLinkDialog");
const receipt_service_1 = require("../../../../services/receipt.service");
const react_toastify_1 = require("react-toastify");
const ReceiptDetails = ({ receipt, onUpdate, onDelete }) => {
  const [linkDialogOpen, setLinkDialogOpen] = (0, react_1.useState)(false);
  const handleUnlink = async () => {
    try {
      const updatedReceipt = await receipt_service_1.ReceiptService.unlinkTransaction(receipt.id);
      onUpdate(updatedReceipt);
      react_toastify_1.toast.success("Receipt unlinked from transaction successfully");
    } catch (error) {
      react_toastify_1.toast.error("Failed to unlink receipt from transaction");
      console.error("Error unlinking receipt:", error);
    }
  };
  return (
    <material_1.Paper sx={{ p: 3 }}>
      <material_1.Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <material_1.Typography variant="h5">Receipt Details</material_1.Typography>
        <material_1.Box>
          {receipt.transactionId ? (
            <material_1.Button
              startIcon={<icons_material_1.Unlink />}
              onClick={handleUnlink}
              color="error"
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Unlink Transaction
            </material_1.Button>
          ) : (
            <material_1.Button
              startIcon={<icons_material_1.Link />}
              onClick={() => setLinkDialogOpen(true)}
              variant="contained"
              sx={{ mr: 1 }}
            >
              Link Transaction
            </material_1.Button>
          )}
          <material_1.IconButton onClick={() => onDelete(receipt.id)} color="error">
            <icons_material_1.Delete />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.Box>

      <material_1.Divider sx={{ my: 2 }} />

      <material_1.Box mb={2}>
        <material_1.Typography variant="subtitle1" color="textSecondary">
          Status
        </material_1.Typography>
        <material_1.Chip
          label={receipt.transactionId ? "Linked" : "Unlinked"}
          color={receipt.transactionId ? "success" : "default"}
        />
      </material_1.Box>

      <material_1.Box mb={2}>
        <material_1.Typography variant="subtitle1" color="textSecondary">
          Transaction
        </material_1.Typography>
        <material_1.Typography variant="body1">
          {receipt.transactionId
            ? `Linked to transaction #${receipt.transactionId}`
            : "No linked transaction"}
        </material_1.Typography>
      </material_1.Box>

      <material_1.Box mb={2}>
        <material_1.Typography variant="subtitle1" color="textSecondary">
          Upload Date
        </material_1.Typography>
        <material_1.Typography variant="body1">
          {new Date(receipt.createdAt).toLocaleDateString()}
        </material_1.Typography>
      </material_1.Box>

      <TransactionLinkDialog_1.TransactionLinkDialog
        receiptId={receipt.id}
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSuccess={onUpdate}
      />
    </material_1.Paper>
  );
};
exports.ReceiptDetails = ReceiptDetails;
//# sourceMappingURL=ReceiptDetails.js.map
