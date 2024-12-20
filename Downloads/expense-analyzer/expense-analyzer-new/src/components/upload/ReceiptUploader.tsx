'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../common/Button';
import { processReceipt } from '@/lib/mindee';
import { db } from '@/lib/db';
import { toast } from 'react-hot-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  receiptData?: {
    merchant: string;
    total: number;
    date: string;
  };
}

export const ReceiptUploader: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        // Upload file to temporary storage and get URL
        const imageUrl = await uploadFile(file);
        
        // Update progress to show processing
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: 50, status: 'processing' as const } 
              : f
          )
        );

        // Process receipt with OCR
        const receiptData = await processReceipt(imageUrl);
        
        // Save to database
        await db.expenses.create({
          date: new Date(receiptData.date),
          description: `Receipt from ${receiptData.merchant}`,
          amount: receiptData.total,
          category: receiptData.category || 'other',
          type: 'personal',
          notes: `Processed from receipt upload`,
        });

        // Update UI
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress: 100, 
                  status: 'complete' as const,
                  receiptData 
                } 
              : f
          )
        );
      } catch (error) {
        console.error('Receipt processing error:', error);
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  status: 'error' as const, 
                  error: error instanceof Error ? error.message : 'Failed to process receipt'
                } 
              : f
          )
        );
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 5,
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processFiles = async () => {
    const completedFiles = files.filter(f => f.status === 'complete');
    if (completedFiles.length === 0) return;

    try {
      // Create receipts in database
      const receipts = await Promise.all(
        completedFiles.map(async file => {
          const { receiptData } = file;
          if (!receiptData) throw new Error('No receipt data found');

          return await db.receipts.create({
            url: file.url,
            date: new Date(receiptData.date),
            merchant: receiptData.merchant,
            total: receiptData.total,
            category: receiptData.category,
            items: receiptData.items
          });
        })
      );

      // Clear files after successful processing
      setFiles([]);

      // Show success message
      toast.success(`Successfully processed ${receipts.length} receipt(s)`);
    } catch (error) {
      console.error('Failed to process receipts:', error);
      toast.error('Failed to process receipts');
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop receipts here, or click to select files'}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Supports JPG, PNG and PDF files
        </p>
      </div>

      <AnimatePresence>
        {files.map(file => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <FileText className="w-8 h-8 text-gray-400 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <div className="mt-1 relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    file.status === 'error' 
                      ? 'bg-red-500' 
                      : file.status === 'complete'
                      ? 'bg-green-500'
                      : 'bg-primary'
                  }`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${file.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {file.error && (
                <p className="mt-1 text-xs text-red-500">{file.error}</p>
              )}
            </div>
            <div className="ml-4 flex items-center space-x-3">
              {file.status === 'uploading' && (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {files.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => setFiles([])}
            variant="outline"
            className="mr-3"
          >
            Clear All
          </Button>
          <Button>
            Process {files.length} Receipt{files.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
};

async function uploadFile(file: File): Promise<string> {
  // TODO: Implement actual file upload to cloud storage
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://temporary-url/${file.name}`);
    }, 1000);
  });
} 