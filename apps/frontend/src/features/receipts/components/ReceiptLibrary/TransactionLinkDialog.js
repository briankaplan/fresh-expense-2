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
exports.TransactionLinkDialog = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const receipt_service_1 = require("../../../../services/receipt.service");
const react_toastify_1 = require("react-toastify");
const TransactionLinkDialog = ({ receiptId, open, onClose, onSuccess }) => {
  const [loading, setLoading] = (0, react_1.useState)(false);
  const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
  const [transactions, setTransactions] = (0, react_1.useState)([]);
  const [selectedTransaction, setSelectedTransaction] = (0, react_1.useState)(null);
  (0, react_1.useEffect)(() => {
    if (open) {
      fetchTransactions();
    }
  }, [open, searchQuery]);
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call to fetch transactions
      const response = await fetch(`/api/transactions?search=${searchQuery}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      react_toastify_1.toast.error("Failed to fetch transactions");
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleLink = async () => {
    if (!selectedTransaction) return;
    try {
      setLoading(true);
      const updatedReceipt = await receipt_service_1.ReceiptService.linkTransaction(
        receiptId,
        selectedTransaction.id,
      );
      onSuccess(updatedReceipt);
      react_toastify_1.toast.success("Receipt linked to transaction successfully");
      onClose();
    } catch (error) {
      react_toastify_1.toast.error("Failed to link receipt to transaction");
      console.error("Error linking receipt:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <material_1.Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <material_1.DialogTitle>
        <material_1.Box display="flex" justifyContent="space-between" alignItems="center">
          <material_1.Typography variant="h6">Link to Transaction</material_1.Typography>
        </material_1.Box>
      </material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.Box mb={2}>
          <material_1.TextField
            fullWidth
            variant="outlined"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <icons_material_1.Search sx={{ mr: 1 }} />,
            }}
          />
        </material_1.Box>
        {loading ? (
          <material_1.Box display="flex" justifyContent="center" p={2}>
            <material_1.CircularProgress />
          </material_1.Box>
        ) : (
          <material_1.List>
            {transactions.map((transaction) => (
              <material_1.ListItem
                key={transaction.id}
                button
                selected={selectedTransaction?.id != null}
                onClick={() => setSelectedTransaction(transaction)}
              >
                <material_1.ListItemText
                  primary={transaction.description}
                  secondary={`${new Date(transaction.date).toLocaleDateString()} - $${transaction.amount}`}
                />
                <material_1.ListItemSecondaryAction>
                  <material_1.IconButton
                    edge="end"
                    onClick={() => setSelectedTransaction(transaction)}
                    disabled={loading}
                  >
                    <icons_material_1.Link />
                  </material_1.IconButton>
                </material_1.ListItemSecondaryAction>
              </material_1.ListItem>
            ))}
          </material_1.List>
        )}
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={onClose} disabled={loading}>
          Cancel
        </material_1.Button>
        <material_1.Button
          onClick={handleLink}
          disabled={loading || !selectedTransaction}
          variant="contained"
          color="primary"
        >
          Link
        </material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>
  );
};
exports.TransactionLinkDialog = TransactionLinkDialog;
//# sourceMappingURL=TransactionLinkDialog.js.map
