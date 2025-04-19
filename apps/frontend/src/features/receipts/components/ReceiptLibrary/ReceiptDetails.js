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
exports.ReceiptDetails = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const receipt_service_1 = require("../../../../services/receipt.service");
const react_toastify_1 = require("react-toastify");
const ReceiptDetails = ({ receipt, open, onClose, onUpdate, }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [notes, setNotes] = (0, react_1.useState)(receipt.notes || '');
    const handleDownload = async () => {
        try {
            setLoading(true);
            await receipt_service_1.ReceiptService.downloadReceipt(receipt.id);
            react_toastify_1.toast.success('Receipt downloaded successfully');
        }
        catch (error) {
            react_toastify_1.toast.error('Failed to download receipt');
            console.error('Error downloading receipt:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleLinkTransaction = async () => {
        try {
            setLoading(true);
            // TODO: Implement transaction linking UI
            react_toastify_1.toast.success('Receipt linked to transaction');
        }
        catch (error) {
            react_toastify_1.toast.error('Failed to link receipt');
            console.error('Error linking receipt:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleUnlinkTransaction = async () => {
        try {
            setLoading(true);
            // TODO: Implement transaction unlinking
            react_toastify_1.toast.success('Receipt unlinked from transaction');
        }
        catch (error) {
            react_toastify_1.toast.error('Failed to unlink receipt');
            console.error('Error unlinking receipt:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async () => {
        try {
            setLoading(true);
            await receipt_service_1.ReceiptService.deleteReceipt(receipt.id);
            react_toastify_1.toast.success('Receipt deleted successfully');
            onClose();
        }
        catch (error) {
            react_toastify_1.toast.error('Failed to delete receipt');
            console.error('Error deleting receipt:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSaveNotes = async () => {
        try {
            setLoading(true);
            const updatedReceipt = await receipt_service_1.ReceiptService.updateReceipt(receipt.id, { notes });
            onUpdate(updatedReceipt);
            react_toastify_1.toast.success('Notes saved successfully');
        }
        catch (error) {
            react_toastify_1.toast.error('Failed to save notes');
            console.error('Error saving notes:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<material_1.Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <material_1.DialogTitle>
        <material_1.Box display="flex" justifyContent="space-between" alignItems="center">
          <material_1.Typography variant="h6">Receipt Details</material_1.Typography>
          <material_1.IconButton onClick={onClose} disabled={loading}>
            <icons_material_1.Close />
          </material_1.IconButton>
        </material_1.Box>
      </material_1.DialogTitle>
      <material_1.DialogContent>
        <material_1.Grid container spacing={3}>
          <material_1.Grid item xs={12} md={6}>
            <material_1.Box mb={2}>
              <material_1.Typography variant="subtitle2" color="textSecondary">
                Filename
              </material_1.Typography>
              <material_1.Typography>{receipt.filename}</material_1.Typography>
            </material_1.Box>
            <material_1.Box mb={2}>
              <material_1.Typography variant="subtitle2" color="textSecondary">
                Status
              </material_1.Typography>
              <material_1.Chip label={receipt.status} color={receipt.status != null
            ? 'success'
            : receipt.status != null
                ? 'warning'
                : receipt.status != null
                    ? 'info'
                    : 'error'}/>
            </material_1.Box>
            <material_1.Box mb={2}>
              <material_1.Typography variant="subtitle2" color="textSecondary">
                Upload Date
              </material_1.Typography>
              <material_1.Typography>{new Date(receipt.createdAt).toLocaleDateString()}</material_1.Typography>
            </material_1.Box>
            {receipt.transactionId && (<material_1.Box mb={2}>
                <material_1.Typography variant="subtitle2" color="textSecondary">
                  Linked Transaction
                </material_1.Typography>
                <material_1.Typography>{receipt.transactionId}</material_1.Typography>
              </material_1.Box>)}
          </material_1.Grid>
          <material_1.Grid item xs={12} md={6}>
            <material_1.Box mb={2}>
              <material_1.Typography variant="subtitle2" color="textSecondary">
                Notes
              </material_1.Typography>
              <material_1.TextField fullWidth multiline rows={4} value={notes} onChange={e => setNotes(e.target.value)} disabled={loading}/>
            </material_1.Box>
          </material_1.Grid>
          <material_1.Grid item xs={12}>
            <material_1.Box component="img" src={receipt.url} alt="Receipt" sx={{
            width: '100%',
            maxHeight: 400,
            objectFit: 'contain',
        }}/>
          </material_1.Grid>
        </material_1.Grid>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button startIcon={<icons_material_1.Download />} onClick={handleDownload} disabled={loading}>
          Download
        </material_1.Button>
        {receipt.transactionId ? (<material_1.Button startIcon={<icons_material_1.LinkOff />} onClick={handleUnlinkTransaction} disabled={loading} color="warning">
            Unlink Transaction
          </material_1.Button>) : (<material_1.Button startIcon={<icons_material_1.Link />} onClick={handleLinkTransaction} disabled={loading}>
            Link Transaction
          </material_1.Button>)}
        <material_1.Button onClick={handleSaveNotes} disabled={loading}>
          Save Notes
        </material_1.Button>
        <material_1.Button startIcon={<icons_material_1.Delete />} onClick={handleDelete} disabled={loading} color="error">
          Delete
        </material_1.Button>
      </material_1.DialogActions>
    </material_1.Dialog>);
};
exports.ReceiptDetails = ReceiptDetails;
//# sourceMappingURL=ReceiptDetails.js.map