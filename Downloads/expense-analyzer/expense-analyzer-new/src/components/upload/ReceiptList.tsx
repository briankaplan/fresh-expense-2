'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';
import { FileText, ExternalLink } from 'lucide-react';

interface ReceiptListProps {
  receipts: Receipt[];
  onReceiptClick: (receipt: Receipt) => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ 
  receipts, 
  onReceiptClick 
}) => {
  return (
    <div className="space-y-4">
      {receipts.map((receipt, index) => (
        <motion.div
          key={receipt.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onReceiptClick(receipt)}
          className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm 
                     hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex-shrink-0 mr-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <h4 className="text-sm font-medium truncate">
                {receipt.merchant}
              </h4>
              <span className="text-sm font-semibold">
                {formatCurrency(receipt.total)}
              </span>
            </div>
            
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span>{formatDateDisplay(new Date(receipt.date))}</span>
              <span className="mx-2">•</span>
              <span className="truncate">{receipt.category || 'Uncategorized'}</span>
            </div>
          </div>

          <ExternalLink className="w-5 h-5 ml-4 text-gray-400" />
        </motion.div>
      ))}
    </div>
  );
}; 