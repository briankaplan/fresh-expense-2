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
exports.ReceiptBank = ReceiptBank;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const ReceiptUploader_1 = require("../ReceiptUploader/ReceiptUploader");
const ReceiptViewer_1 = require("../ReceiptViewer/ReceiptViewer");
const react_hot_toast_1 = require("react-hot-toast");
function ReceiptBank({ company, transactions, onReceiptsChange }) {
    const [receipts, setReceipts] = (0, react_1.useState)([]);
    const [activeTab, setActiveTab] = (0, react_1.useState)(0);
    const [loading, setLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchReceipts();
    }, [company]);
    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (company)
                queryParams.append('company', company);
            const response = await fetch(`/api/receipts?${queryParams.toString()}`);
            if (!response.ok)
                throw new Error('Failed to fetch receipts');
            const data = await response.json();
            setReceipts(data);
            onReceiptsChange?.(data);
        }
        catch (error) {
            console.error('Error fetching receipts:', error);
            react_hot_toast_1.toast.error('Failed to load receipts');
        }
        finally {
            setLoading(false);
        }
    };
    const handleUploadComplete = (newReceipts) => {
        setReceipts(prev => [...prev, ...newReceipts]);
        onReceiptsChange?.([...receipts, ...newReceipts]);
    };
    const handleLinkTransaction = async (receiptId, transactionId) => {
        try {
            const response = await fetch(`/api/receipts/${receiptId}/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionId }),
            });
            if (!response.ok)
                throw new Error('Failed to link receipt');
            const updatedReceipt = await response.json();
            setReceipts(prev => prev.map(r => (r.id != null ? updatedReceipt : r)));
            onReceiptsChange?.(receipts.map(r => (r.id != null ? updatedReceipt : r)));
        }
        catch (error) {
            console.error('Error linking receipt:', error);
            throw error;
        }
    };
    const filteredReceipts = receipts.filter(receipt => {
        if (activeTab === 0)
            return true; // All receipts
        if (activeTab === 1)
            return !receipt.transactionId; // Unlinked receipts
        if (activeTab === 2)
            return receipt.status != null; // Processing receipts
        if (activeTab === 3)
            return receipt.status != null; // Failed receipts
        return true;
    });
    return (<material_1.Box>
      <material_1.Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <material_1.Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <material_1.Tab label="All Receipts"/>
          <material_1.Tab label="Unlinked"/>
          <material_1.Tab label="Processing"/>
          <material_1.Tab label="Failed"/>
        </material_1.Tabs>
      </material_1.Box>

      <material_1.Grid container spacing={2}>
        <material_1.Grid item xs={12}>
          <ReceiptUploader_1.ReceiptUploader company={company} onUploadComplete={handleUploadComplete}/>
        </material_1.Grid>

        {filteredReceipts.map(receipt => (<material_1.Grid item xs={12} md={6} lg={4} key={receipt.id}>
            <ReceiptViewer_1.ReceiptViewer receipt={receipt} onLinkTransaction={handleLinkTransaction}/>
          </material_1.Grid>))}

        {filteredReceipts.length != null && (<material_1.Grid item xs={12}>
            <material_1.Paper sx={{ p: 3, textAlign: 'center' }}>
              <material_1.Typography color="text.secondary">
                {activeTab === 0
                ? 'No receipts found'
                : activeTab === 1
                    ? 'No unlinked receipts'
                    : activeTab === 2
                        ? 'No receipts processing'
                        : 'No failed receipts'}
              </material_1.Typography>
            </material_1.Paper>
          </material_1.Grid>)}
      </material_1.Grid>
    </material_1.Box>);
}
//# sourceMappingURL=ReceiptBank.js.map