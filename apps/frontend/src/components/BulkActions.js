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
exports.BulkActions = BulkActions;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
function BulkActions({ selectedExpenses, onDelete, onEdit, onLabel, onShare }) {
  const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = (0, react_1.useState)(false);
  const [label, setLabel] = (0, react_1.useState)("");
  const [error, setError] = (0, react_1.useState)("");
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    onDelete(selectedExpenses.map((expense) => expense.id));
    handleMenuClose();
  };
  const handleEdit = () => {
    onEdit(selectedExpenses.map((expense) => expense.id));
    handleMenuClose();
  };
  const handleLabel = () => {
    if (!label.trim()) {
      setError("Please enter a label");
      return;
    }
    onLabel(
      selectedExpenses.map((expense) => expense.id),
      label,
    );
    setLabel("");
    setIsLabelDialogOpen(false);
    handleMenuClose();
  };
  const handleShare = () => {
    onShare(selectedExpenses.map((expense) => expense.id));
    handleMenuClose();
  };
  return (
    <>
      <material_1.Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <material_1.Typography variant="body2" color="text.secondary">
          {selectedExpenses.length} selected
        </material_1.Typography>
        <material_1.Button
          variant="outlined"
          size="small"
          onClick={handleMenuClick}
          endIcon={<icons_material_1.MoreVert />}
        >
          Actions
        </material_1.Button>
      </material_1.Box>

      <material_1.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <material_1.MenuItem onClick={handleEdit}>
          <icons_material_1.Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Selected
        </material_1.MenuItem>
        <material_1.MenuItem onClick={() => setIsLabelDialogOpen(true)}>
          <icons_material_1.Label fontSize="small" sx={{ mr: 1 }} />
          Add Label
        </material_1.MenuItem>
        <material_1.MenuItem onClick={handleShare}>
          <icons_material_1.Share fontSize="small" sx={{ mr: 1 }} />
          Share Selected
        </material_1.MenuItem>
        <material_1.MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <icons_material_1.Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Selected
        </material_1.MenuItem>
      </material_1.Menu>

      <material_1.Dialog
        open={isLabelDialogOpen}
        onClose={() => setIsLabelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <material_1.DialogTitle>Add Label to Selected Expenses</material_1.DialogTitle>
        <material_1.DialogContent>
          {error && (
            <material_1.Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </material_1.Alert>
          )}
          <material_1.TextField
            autoFocus
            fullWidth
            label="Label"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setError("");
            }}
            onKeyPress={(e) => e.key === "Enter" && handleLabel()}
          />
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setIsLabelDialogOpen(false)}>Cancel</material_1.Button>
          <material_1.Button onClick={handleLabel} variant="contained">
            Apply Label
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </>
  );
}
//# sourceMappingURL=BulkActions.js.map
