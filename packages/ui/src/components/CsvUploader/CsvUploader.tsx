import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, CircularProgress, Alert, Button, styled } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const DropzoneContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

export interface CsvUploaderProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
}

export function CsvUploader({
  onUpload,
  accept = ['.csv'],
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
}: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setIsUploading(true);
        setError(null);
        await onUpload(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
  });

  return (
    <Box>
      <DropzoneContainer
        {...getRootProps()}
        sx={{
          backgroundColor: theme => (isDragActive ? theme.palette.action.hover : 'inherit'),
        }}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Uploading...</Typography>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the file here' : 'Drag and drop a CSV file here'}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              or
            </Typography>
            <Button variant="outlined" component="span">
              Browse Files
            </Button>
            <Typography variant="caption" display="block" mt={1} color="textSecondary">
              Accepted file types: {accept.join(', ')}
              <br />
              Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
            </Typography>
          </Box>
        )}
      </DropzoneContainer>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
