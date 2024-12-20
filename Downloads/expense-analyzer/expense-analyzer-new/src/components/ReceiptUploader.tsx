import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface ReceiptUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onUpload, isUploading = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="btn-secondary"
      >
        {isUploading ? 'Uploading...' : 'Upload Receipt'}
      </motion.button>
    </div>
  );
}; 