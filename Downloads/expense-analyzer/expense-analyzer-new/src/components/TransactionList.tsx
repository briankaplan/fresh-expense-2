'use client';

import React, { useState } from 'react';
import { ReceiptUploader } from './ReceiptUploader';
import { BankTransaction, ReconciledItem } from '@/types';

interface TransactionListProps {
  transactions: BankTransaction[];
  reconciledItems: ReconciledItem[];
  onUploadReceipt: (transactionId: string, imageUrl: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  reconciledItems,
  onUploadReceipt,
}) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleUpload = async (transactionId: string, file: File) => {
    try {
      setUploadingId(transactionId);
      
      // Create FormData for the file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await uploadResponse.json();
      
      // Call the parent handler with the transaction ID and image URL
      await onUploadReceipt(transactionId, url);
      
    } catch (error) {
      console.error('Upload error:', error);
      // You might want to show an error toast here
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {transactions.map(transaction => (
        <div 
          key={transaction.id}
          className="p-4 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{transaction.description}</h3>
              <p className="text-sm text-gray-500">${transaction.amount}</p>
            </div>
            <ReceiptUploader
              onUpload={(file) => handleUpload(transaction.id, file)}
              isUploading={uploadingId === transaction.id}
            />
          </div>
        </div>
      ))}
    </div>
  );
};