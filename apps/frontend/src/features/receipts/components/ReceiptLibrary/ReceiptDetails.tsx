import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close, Download, Link, LinkOff, Delete, Edit, Save } from '@mui/icons-material';
import { ReceiptService } from '../../../../services/receipt.service';
import { toast } from 'react-toastify';
import { Receipt } from '@fresh-expense/types';

interface ReceiptDetailsProps {
  receipt: Receipt;
  open: boolean;
  onClose: () => void;
  onUpdate: (receipt: Receipt) => void;
}

export const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({
  receipt,
  open,
  onClose,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(receipt.notes || '');

  const handleDownload = async () => {
    try {
      setLoading(true);
      await ReceiptService.downloadReceipt(receipt.id);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error('Failed to download receipt');
      console.error('Error downloading receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkTransaction = async () => {
    try {
      setLoading(true);
      // TODO: Implement transaction linking UI
      toast.success('Receipt linked to transaction');
    } catch (error) {
      toast.error('Failed to link receipt');
      console.error('Error linking receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkTransaction = async () => {
    try {
      setLoading(true);
      // TODO: Implement transaction unlinking
      toast.success('Receipt unlinked from transaction');
    } catch (error) {
      toast.error('Failed to unlink receipt');
      console.error('Error unlinking receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await ReceiptService.deleteReceipt(receipt.id);
      toast.success('Receipt deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete receipt');
      console.error('Error deleting receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setLoading(true);
      const updatedReceipt = await ReceiptService.updateReceipt(receipt.id, { notes });
      onUpdate(updatedReceipt);
      toast.success('Notes saved successfully');
    } catch (error) {
      toast.error('Failed to save notes');
      console.error('Error saving notes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Receipt Details</Typography>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Filename
              </Typography>
              <Typography>{receipt.filename}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Chip
                label={receipt.status}
                color={
                  receipt.status != null
                    ? 'success'
                    : receipt.status != null
                      ? 'warning'
                      : receipt.status != null
                        ? 'info'
                        : 'error'
                }
              />
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Upload Date
              </Typography>
              <Typography>{new Date(receipt.createdAt).toLocaleDateString()}</Typography>
            </Box>
            {receipt.transactionId && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Linked Transaction
                </Typography>
                <Typography>{receipt.transactionId}</Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                disabled={loading}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              component="img"
              src={receipt.url}
              alt="Receipt"
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain',
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button startIcon={<Download />} onClick={handleDownload} disabled={loading}>
          Download
        </Button>
        {receipt.transactionId ? (
          <Button
            startIcon={<LinkOff />}
            onClick={handleUnlinkTransaction}
            disabled={loading}
            color="warning"
          >
            Unlink Transaction
          </Button>
        ) : (
          <Button startIcon={<Link />} onClick={handleLinkTransaction} disabled={loading}>
            Link Transaction
          </Button>
        )}
        <Button onClick={handleSaveNotes} disabled={loading}>
          Save Notes
        </Button>
        <Button startIcon={<Delete />} onClick={handleDelete} disabled={loading} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
