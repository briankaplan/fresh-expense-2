import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { CloudUpload, Delete, Visibility } from '@mui/icons-material';
import { ReceiptService } from '../../../../services/receipt.service';
import { toast } from 'react-toastify';
import { Receipt } from '@fresh-expense/types';

interface ReceiptManagerProps {
  transactionId: string;
  onReceiptChange?: (receipt: Receipt | null) => void;
}

export const ReceiptManager: React.FC<ReceiptManagerProps> = ({
  transactionId,
  onReceiptChange,
}) => {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const uploadedReceipt = await ReceiptService.uploadReceipt(transactionId, file);
      setReceipt(uploadedReceipt);
      onReceiptChange?.(uploadedReceipt);
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload receipt');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await ReceiptService.deleteReceipt(transactionId);
      setReceipt(null);
      onReceiptChange?.(null);
      toast.success('Receipt deleted successfully');
    } catch (error) {
      toast.error('Failed to delete receipt');
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!receipt) {
      try {
        setLoading(true);
        const fetchedReceipt = await ReceiptService.getReceipt(transactionId);
        setReceipt(fetchedReceipt);
        setPreviewOpen(true);
      } catch (error) {
        toast.error('Failed to fetch receipt');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setPreviewOpen(true);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <input
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        id={`receipt-upload-${transactionId}`}
        type="file"
        onChange={handleFileUpload}
        disabled={loading}
      />
      <label htmlFor={`receipt-upload-${transactionId}`}>
        <Button variant="outlined" component="span" startIcon={<CloudUpload />} disabled={loading}>
          Upload Receipt
        </Button>
      </label>

      {receipt && (
        <>
          <IconButton onClick={handlePreview} disabled={loading}>
            <Visibility />
          </IconButton>
          <IconButton onClick={handleDelete} disabled={loading}>
            <Delete />
          </IconButton>
        </>
      )}

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Receipt Preview</DialogTitle>
        <DialogContent>
          {receipt && (
            <Box
              component="img"
              src={receipt.url}
              alt="Receipt"
              sx={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
