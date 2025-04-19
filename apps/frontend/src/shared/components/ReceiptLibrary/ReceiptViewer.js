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
exports.ReceiptViewer = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const ReceiptViewer = ({ receiptUrl, receiptData, onClose, }) => {
    const [zoom, setZoom] = (0, react_1.useState)(1);
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 3));
    };
    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    };
    const handleDownload = async () => {
        try {
            const response = await fetch(receiptUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = receiptData.filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        catch (error) {
            console.error('Download failed:', error);
        }
    };
    return (<>
      <material_1.DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }}>
        <material_1.Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Receipt Details
        </material_1.Typography>
        <material_1.IconButton aria-label="close" onClick={onClose} sx={{ color: 'grey.500' }}>
          <icons_material_1.Close />
        </material_1.IconButton>
      </material_1.DialogTitle>
      <material_1.DialogContent dividers>
        <material_1.Box sx={{ display: 'flex', gap: 2 }}>
          {/* Receipt Image */}
          <material_1.Box sx={{
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
        }}>
            <material_1.Paper sx={{
            height: 600,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
              <material_1.Box component="img" src={receiptUrl} alt="Receipt" sx={{
            maxWidth: '100%',
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s',
        }}/>
            </material_1.Paper>
            <material_1.Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <material_1.IconButton onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <icons_material_1.ZoomOut />
              </material_1.IconButton>
              <material_1.IconButton onClick={handleZoomIn} disabled={zoom >= 3}>
                <icons_material_1.ZoomIn />
              </material_1.IconButton>
            </material_1.Box>
          </material_1.Box>

          {/* Receipt Details */}
          <material_1.Box sx={{ flex: 1 }}>
            <material_1.Paper sx={{ p: 2 }}>
              <material_1.Typography variant="h6" gutterBottom>
                Receipt Information
              </material_1.Typography>
              <material_1.Divider sx={{ my: 2 }}/>

              <material_1.Typography variant="subtitle2" color="text.secondary">
                Merchant
              </material_1.Typography>
              <material_1.Typography variant="body1" gutterBottom>
                {receiptData.merchant}
              </material_1.Typography>

              <material_1.Typography variant="subtitle2" color="text.secondary">
                Amount
              </material_1.Typography>
              <material_1.Typography variant="body1" gutterBottom>
                ${receiptData.amount.toFixed(2)}
              </material_1.Typography>

              <material_1.Typography variant="subtitle2" color="text.secondary">
                Date
              </material_1.Typography>
              <material_1.Typography variant="body1" gutterBottom>
                {new Date(receiptData.date).toLocaleDateString()}
              </material_1.Typography>

              <material_1.Typography variant="subtitle2" color="text.secondary">
                Filename
              </material_1.Typography>
              <material_1.Typography variant="body1" gutterBottom>
                {receiptData.filename}
              </material_1.Typography>

              <material_1.Button fullWidth variant="outlined" startIcon={<icons_material_1.Download />} onClick={handleDownload} sx={{ mt: 2 }}>
                Download Receipt
              </material_1.Button>
            </material_1.Paper>
          </material_1.Box>
        </material_1.Box>
      </material_1.DialogContent>
      <material_1.DialogActions>
        <material_1.Button onClick={onClose}>Close</material_1.Button>
      </material_1.DialogActions>
    </>);
};
exports.ReceiptViewer = ReceiptViewer;
//# sourceMappingURL=ReceiptViewer.js.map