import React, { useState } from 'react';
import { Box, Paper, Typography, IconButton, CircularProgress, Chip, Tooltip } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

interface ReceiptViewerProps {
  receipt: Receipt;
  onLinkTransaction?: (receiptId: string, transactionId: string) => Promise<void>;
}

interface Receipt {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  transactionId?: string;
  url?: string;
  uploadedAt: string;
  metadata?: {
    date?: string;
    amount?: number;
    merchant?: string;
  };
}

export function ReceiptViewer({ receipt, onLinkTransaction }: ReceiptViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleRotateLeft = () => setRotation(prev => (prev - 90) % 360);
  const handleRotateRight = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = async () => {
    if (!receipt.url) return;

    try {
      const response = await fetch(receipt.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = receipt.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handleLinkTransaction = async (transactionId: string) => {
    if (!onLinkTransaction) return;

    try {
      setIsLoading(true);
      await onLinkTransaction(receipt.id, transactionId);
      toast.success('Receipt linked to transaction');
    } catch (error) {
      console.error('Error linking receipt:', error);
      toast.error('Failed to link receipt to transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">{receipt.filename}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={receipt.status}
            color={
              receipt.status != null
                ? 'success'
                : receipt.status != null
                  ? 'warning'
                  : 'error'
            }
            size="small"
          />
          {receipt.transactionId && (
            <Chip icon={<LinkIcon />} label="Linked" color="primary" size="small" />
          )}
        </Box>
      </Box>

      {receipt.status != null ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 4,
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 48 }} />
          <Typography color="error">
            Failed to process receipt. Please try uploading again.
          </Typography>
        </Box>
      ) : receipt.status != null ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 4,
          }}
        >
          <CircularProgress />
          <Typography>Processing receipt...</Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Box
              component="img"
              src={receipt.url}
              alt={receipt.filename}
              sx={{
                width: '100%',
                height: 'auto',
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Zoom In">
                <IconButton onClick={handleZoomIn} size="small">
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton onClick={handleZoomOut} size="small">
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rotate Left">
                <IconButton onClick={handleRotateLeft} size="small">
                  <RotateLeftIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rotate Right">
                <IconButton onClick={handleRotateRight} size="small">
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Tooltip title="Download">
              <IconButton onClick={handleDownload} size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {receipt.metadata && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Extracted Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {receipt.metadata.date && (
                  <Typography variant="body2">
                    Date: {new Date(receipt.metadata.date).toLocaleDateString()}
                  </Typography>
                )}
                {receipt.metadata.amount && (
                  <Typography variant="body2">
                    Amount: ${receipt.metadata.amount.toFixed(2)}
                  </Typography>
                )}
                {receipt.metadata.merchant && (
                  <Typography variant="body2">Merchant: {receipt.metadata.merchant}</Typography>
                )}
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}
