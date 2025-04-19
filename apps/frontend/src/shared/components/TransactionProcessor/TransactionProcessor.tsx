import { Receipt, TellerAccount, TellerTransaction, type Transaction } from "@fresh-expense/types";
import { CheckCircle as CheckCircleIcon, Warning as WarningIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import type React from "react";
import { useCallback, useState } from "react";
import TransactionEnrichmentService from "../../services/TransactionEnrichmentService";
import {
  TransactionMappingError,
  type TransactionStatus,
  TransactionValidationError,
  categorizeTransactionType,
  formatTransactionAmount,
  getTransactionStatusLabel,
  needsReview,
} from "../../types/teller";

interface TransactionProcessorProps {
  transaction: Transaction & { status: TransactionStatus };
  onProcessingComplete?: (updatedTransaction: Transaction) => void;
  onError?: (error: Error) => void;
}

export const TransactionProcessor: React.FC<TransactionProcessorProps> = ({
  transaction,
  onProcessingComplete,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedTransaction, setProcessedTransaction] = useState<Transaction | null>(null);

  const enrichmentService = TransactionEnrichmentService.getInstance();

  const handleProcessTransaction = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const enrichedTransaction = await enrichmentService.processWithAI(transaction);
      setProcessedTransaction(enrichedTransaction);
      onProcessingComplete?.(enrichedTransaction);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  }, [transaction, enrichmentService, onProcessingComplete, onError]);

  const handleReprocess = useCallback(async () => {
    if (!processedTransaction) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reprocessedTransaction =
        await enrichmentService.reprocessTransaction(processedTransaction);
      setProcessedTransaction(reprocessedTransaction);
      onProcessingComplete?.(reprocessedTransaction);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  }, [processedTransaction, enrichmentService, onProcessingComplete, onError]);

  const transactionType = categorizeTransactionType(transaction);
  const requiresReview = needsReview(transaction);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          {/* Transaction Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{transaction.merchant}</Typography>
            <Typography
              variant="h6"
              color={transactionType === "expense" ? "error" : "success.main"}
            >
              {formatTransactionAmount(transaction.amount)}
            </Typography>
          </Box>

          {/* Transaction Details */}
          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              label={transaction.category || "Uncategorized"}
              color={transaction.isAICategorized ? "primary" : "default"}
            />
            <Chip
              size="small"
              label={getTransactionStatusLabel(transaction.status)}
              color={transaction.status != null ? "success" : "default"}
            />
            {transaction.receiptId && (
              <Chip size="small" icon={<ReceiptIcon />} label="Receipt Attached" color="info" />
            )}
            {requiresReview && (
              <Chip size="small" icon={<WarningIcon />} label="Needs Review" color="warning" />
            )}
          </Stack>

          {/* Processing Status */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {processedTransaction && !error && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleReprocess}
                  disabled={isProcessing}
                >
                  Reprocess
                </Button>
              }
            >
              Transaction processed successfully
            </Alert>
          )}

          {/* Action Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="contained"
              onClick={handleProcessTransaction}
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} /> : undefined}
            >
              {isProcessing ? "Processing..." : "Process Transaction"}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
