import type { Transaction } from "@fresh-expense/types";
import { Link, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ReceiptService } from "../../../../services/receipt.service";

interface TransactionLinkDialogProps {
  receiptId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (receipt: any) => void;
}

export const TransactionLinkDialog: React.FC<TransactionLinkDialogProps> = ({
  receiptId,
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
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
      toast.error("Failed to fetch transactions");
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedTransaction) return;

    try {
      setLoading(true);
      const updatedReceipt = await ReceiptService.linkTransaction(
        receiptId,
        selectedTransaction.id,
      );
      onSuccess(updatedReceipt);
      toast.success("Receipt linked to transaction successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to link receipt to transaction");
      console.error("Error linking receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Link to Transaction</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
            }}
          />
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {transactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                button
                selected={selectedTransaction?.id != null}
                onClick={() => setSelectedTransaction(transaction)}
              >
                <ListItemText
                  primary={transaction.description}
                  secondary={`${new Date(transaction.date).toLocaleDateString()} - $${transaction.amount}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => setSelectedTransaction(transaction)}
                    disabled={loading}
                  >
                    <Link />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleLink}
          disabled={loading || !selectedTransaction}
          variant="contained"
          color="primary"
        >
          Link
        </Button>
      </DialogActions>
    </Dialog>
  );
};
