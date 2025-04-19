import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

interface ReceiptUploaderProps {
  onUploadComplete?: (receipts: Receipt[]) => void;
  company?: string;
}

interface Receipt {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  transactionId?: string;
  url?: string;
  uploadedAt: string;
}

export function ReceiptUploader({ onUploadComplete, company }: ReceiptUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.pdf'],
    },
    maxFiles: 10,
    onDrop: async acceptedFiles => {
      setIsUploading(true);
      const uploadPromises = acceptedFiles.map(async file => {
        const formData = new FormData();
        formData.append('file', file);
        if (company) {
          formData.append('company', company);
        }

        try {
          const response = await fetch('/api/receipts/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          const receipt = await response.json();
          return receipt;
        } catch (error) {
          console.error('Error uploading receipt:', error);
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result): result is Receipt => result !== null);

      if (successfulUploads.length > 0) {
        toast.success(`Successfully uploaded ${successfulUploads.length} receipt(s)`);
        onUploadComplete?.(successfulUploads);
      }

      setIsUploading(false);
    },
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <input {...getInputProps()} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {isUploading ? (
          <>
            <CircularProgress />
            <Typography>Uploading receipts...</Typography>
          </>
        ) : (
          <>
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6">
              {isDragActive ? 'Drop receipts here' : 'Drag & drop receipts here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: JPG, PNG, PDF
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}
