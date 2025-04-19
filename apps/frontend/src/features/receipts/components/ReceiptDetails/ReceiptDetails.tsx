import { Delete, Edit, Link, Unlink } from "@mui/icons-material";
import { Box, Button, Chip, Divider, IconButton, Paper, Typography } from "@mui/material";
import type React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { ReceiptService } from "../../../../services/receipt.service";
import { TransactionLinkDialog } from "../ReceiptLibrary/TransactionLinkDialog";

interface ReceiptDetailsProps {
  receipt: any;
  onUpdate: (receipt: any) => void;
  onDelete: (receiptId: string) => void;
}

export const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({ receipt, onUpdate, onDelete }) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const handleUnlink = async () => {
    try {
      const updatedReceipt = await ReceiptService.unlinkTransaction(receipt.id);
      onUpdate(updatedReceipt);
      toast.success("Receipt unlinked from transaction successfully");
    } catch (error) {
      toast.error("Failed to unlink receipt from transaction");
      console.error("Error unlinking receipt:", error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Receipt Details</Typography>
        <Box>
          {receipt.transactionId ? (
            <Button
              startIcon={<Unlink />}
              onClick={handleUnlink}
              color="error"
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Unlink Transaction
            </Button>
          ) : (
            <Button
              startIcon={<Link />}
              onClick={() => setLinkDialogOpen(true)}
              variant="contained"
              sx={{ mr: 1 }}
            >
              Link Transaction
            </Button>
          )}
          <IconButton onClick={() => onDelete(receipt.id)} color="error">
            <Delete />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box mb={2}>
        <Typography variant="subtitle1" color="textSecondary">
          Status
        </Typography>
        <Chip
          label={receipt.transactionId ? "Linked" : "Unlinked"}
          color={receipt.transactionId ? "success" : "default"}
        />
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle1" color="textSecondary">
          Transaction
        </Typography>
        <Typography variant="body1">
          {receipt.transactionId
            ? `Linked to transaction #${receipt.transactionId}`
            : "No linked transaction"}
        </Typography>
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle1" color="textSecondary">
          Upload Date
        </Typography>
        <Typography variant="body1">{new Date(receipt.createdAt).toLocaleDateString()}</Typography>
      </Box>

      <TransactionLinkDialog
        receiptId={receipt.id}
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSuccess={onUpdate}
      />
    </Paper>
  );
};
