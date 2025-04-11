import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';

interface ReceiptUploadProps {
  onSuccess: (receipt: any) => void;
  onCancel: () => void;
  transactionId?: string;
}

export const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  onSuccess,
  onCancel,
  transactionId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !merchant || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('merchant', merchant);
      formData.append('amount', amount);
      if (transactionId) {
        formData.append('transactionId', transactionId);
      }

      const response = await api.post('/receipts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess(response.data);
    } catch (err) {
      setError('Failed to upload receipt. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>Upload Receipt</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              p: 3,
              mb: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            {preview ? (
              <Box
                component="img"
                src={preview}
                alt="Receipt preview"
                sx={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Typography>
                {isDragActive
                  ? 'Drop the receipt here'
                  : 'Drag and drop a receipt, or click to select'}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Merchant"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            required
            type="number"
            inputProps={{ step: '0.01' }}
          />

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !file}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </DialogActions>
    </>
  );
}; 