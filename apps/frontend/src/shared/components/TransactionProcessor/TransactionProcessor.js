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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionProcessor = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const teller_1 = require("../../types/teller");
const TransactionEnrichmentService_1 = __importDefault(require("../../services/TransactionEnrichmentService"));
const TransactionProcessor = ({ transaction, onProcessingComplete, onError, }) => {
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [processedTransaction, setProcessedTransaction] = (0, react_1.useState)(null);
    const enrichmentService = TransactionEnrichmentService_1.default.getInstance();
    const handleProcessTransaction = (0, react_1.useCallback)(async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const enrichedTransaction = await enrichmentService.processWithAI(transaction);
            setProcessedTransaction(enrichedTransaction);
            onProcessingComplete?.(enrichedTransaction);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
        finally {
            setIsProcessing(false);
        }
    }, [transaction, enrichmentService, onProcessingComplete, onError]);
    const handleReprocess = (0, react_1.useCallback)(async () => {
        if (!processedTransaction)
            return;
        setIsProcessing(true);
        setError(null);
        try {
            const reprocessedTransaction = await enrichmentService.reprocessTransaction(processedTransaction);
            setProcessedTransaction(reprocessedTransaction);
            onProcessingComplete?.(reprocessedTransaction);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
        finally {
            setIsProcessing(false);
        }
    }, [processedTransaction, enrichmentService, onProcessingComplete, onError]);
    const transactionType = (0, teller_1.categorizeTransactionType)(transaction);
    const requiresReview = (0, teller_1.needsReview)(transaction);
    return (<material_1.Card variant="outlined">
      <material_1.CardContent>
        <material_1.Stack spacing={2}>
          {/* Transaction Header */}
          <material_1.Box display="flex" justifyContent="space-between" alignItems="center">
            <material_1.Typography variant="h6">{transaction.merchant}</material_1.Typography>
            <material_1.Typography variant="h6" color={transactionType === 'expense' ? 'error' : 'success.main'}>
              {(0, teller_1.formatTransactionAmount)(transaction.amount)}
            </material_1.Typography>
          </material_1.Box>

          {/* Transaction Details */}
          <material_1.Stack direction="row" spacing={1}>
            <material_1.Chip size="small" label={transaction.category || 'Uncategorized'} color={transaction.isAICategorized ? 'primary' : 'default'}/>
            <material_1.Chip size="small" label={(0, teller_1.getTransactionStatusLabel)(transaction.status)} color={transaction.status != null ? 'success' : 'default'}/>
            {transaction.receiptId && (<material_1.Chip size="small" icon={<ReceiptIcon />} label="Receipt Attached" color="info"/>)}
            {requiresReview && (<material_1.Chip size="small" icon={<icons_material_1.Warning />} label="Needs Review" color="warning"/>)}
          </material_1.Stack>

          {/* Processing Status */}
          {error && (<material_1.Alert severity="error" onClose={() => setError(null)}>
              {error}
            </material_1.Alert>)}

          {processedTransaction && !error && (<material_1.Alert severity="success" icon={<icons_material_1.CheckCircle />} action={<material_1.Button color="inherit" size="small" onClick={handleReprocess} disabled={isProcessing}>
                  Reprocess
                </material_1.Button>}>
              Transaction processed successfully
            </material_1.Alert>)}

          {/* Action Buttons */}
          <material_1.Box display="flex" justifyContent="flex-end" gap={1}>
            <material_1.Button variant="contained" onClick={handleProcessTransaction} disabled={isProcessing} startIcon={isProcessing ? <material_1.CircularProgress size={20}/> : undefined}>
              {isProcessing ? 'Processing...' : 'Process Transaction'}
            </material_1.Button>
          </material_1.Box>
        </material_1.Stack>
      </material_1.CardContent>
    </material_1.Card>);
};
exports.TransactionProcessor = TransactionProcessor;
//# sourceMappingURL=TransactionProcessor.js.map