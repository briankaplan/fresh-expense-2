'use client';

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ReceiptUploadModalProps {
  expenseId: string;
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
}

export const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({
  expenseId,
  onUpload,
  onClose
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type.startsWith('image/') || droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      setError('Failed to upload receipt');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Upload Receipt</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
        >
          {file ? (
            <div>
              <p className="text-sm text-gray-600">{file.name}</p>
              <button 
                onClick={() => setFile(null)}
                className="text-red-600 text-sm mt-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drop receipt here or click to browse
              </p>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
}; 