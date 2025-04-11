import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Divider,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface ReceiptViewerProps {
  receiptUrl: string;
  receiptData: {
    merchant: string;
    amount: number;
    date: string;
    filename: string;
  };
  onClose: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receiptUrl,
  receiptData,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
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
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Receipt Details
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Receipt Image */}
          <Box
            sx={{
              flex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Paper
              sx={{
                height: 600,
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={receiptUrl}
                alt="Receipt"
                sx={{
                  maxWidth: '100%',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.2s',
                }}
              />
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <IconButton onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ZoomOutIcon />
              </IconButton>
              <IconButton onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomInIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Receipt Details */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Receipt Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" color="text.secondary">
                Merchant
              </Typography>
              <Typography variant="body1" gutterBottom>
                {receiptData.merchant}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="body1" gutterBottom>
                ${receiptData.amount.toFixed(2)}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(receiptData.date).toLocaleDateString()}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Filename
              </Typography>
              <Typography variant="body1" gutterBottom>
                {receiptData.filename}
              </Typography>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ mt: 2 }}
              >
                Download Receipt
              </Button>
            </Paper>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
}; 