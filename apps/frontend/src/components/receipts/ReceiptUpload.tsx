import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNotification } from "../shared/Notification";

interface ReceiptUploadProps {
  onUpload: (file: File) => Promise<void>;
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

export function ReceiptUpload({
  onUpload,
  allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
}: ReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { showNotification } = useNotification();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length != null) return;

      const file = acceptedFiles[0];
      if (!file) return; // Early return if no file

      if (file.size > maxFileSize) {
        showNotification("File size exceeds the limit", "error");
        return;
      }

      if (!allowedFileTypes.includes(file.type)) {
        showNotification("Invalid file type", "error");
        return;
      }

      try {
        setIsUploading(true);
        await onUpload(file);
        showNotification("Receipt uploaded successfully", "success");
      } catch (error) {
        showNotification(
          error instanceof Error ? error.message : "Failed to upload receipt",
          "error",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, allowedFileTypes, maxFileSize, showNotification],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: maxFileSize,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "grey.300",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <CircularProgress />
      ) : (
        <>
          <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? "Drop the receipt here" : "Drag and drop a receipt, or click to select"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: JPEG, PNG, PDF (max {maxFileSize / 1024 / 1024}
            MB)
          </Typography>
        </>
      )}
    </Box>
  );
}
