'use client';

import React, { useState } from 'react';
import { BankTransaction } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';
import { Receipt, FileText, AlertTriangle, ChevronDown, ChevronUp, Split } from 'lucide-react';
import { ReceiptPreview } from '../receipts/ReceiptPreview';
import { SplitTransactionModal } from './SplitTransactionModal';

interface TransactionCardProps {
  transaction: BankTransaction;
  onMarkPersonal?: (id: string) => void;
  onMarkBusiness?: (id: string) => void;
  onSplit?: (id: string, personalAmount: number, businessAmount: number) => void;
  showActions?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onMarkPersonal,
  onMarkBusiness,
  onSplit,
  showActions = true
}) => {
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatDateDisplay(transaction.date)}
            </span>
            {!transaction.hasReceipt && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Missing Receipt
              </span>
            )}
          </div>
          
          <h3 className="font-medium mt-1">
            {transaction.description}
          </h3>
        </div>

        <div className="text-right">
          <p className="font-bold text-lg">{formatCurrency(transaction.amount)}</p>
          {showActions && (
            <div className="mt-2 space-y-1">
              <button
                onClick={() => onMarkPersonal?.(transaction.id)}
                className="text-sm text-purple-600 hover:text-purple-800 block ml-auto"
              >
                Personal
              </button>
              <button
                onClick={() => onMarkBusiness?.(transaction.id)}
                className="text-sm text-green-600 hover:text-green-800 block ml-auto"
              >
                Business
              </button>
              {onSplit && (
                <button
                  onClick={() => setShowSplitModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-auto"
                >
                  <Split className="w-4 h-4" />
                  Split
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {isExpanded ? 'Less Details' : 'More Details'}
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {transaction.category && (
            <div className="text-sm">
              <span className="font-medium">Category:</span>{' '}
              <span className="text-gray-600">{transaction.category}</span>
            </div>
          )}
          
          {transaction.receiptUrl && (
            <button
              onClick={() => setShowReceiptPreview(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Receipt className="w-4 h-4" />
              View Receipt
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showSplitModal && onSplit && (
        <SplitTransactionModal
          transaction={transaction}
          onSplit={(personalAmount, businessAmount) => {
            onSplit(transaction.id, personalAmount, businessAmount);
            setShowSplitModal(false);
          }}
          onClose={() => setShowSplitModal(false)}
        />
      )}

      {showReceiptPreview && transaction.receiptUrl && (
        <ReceiptPreview
          transaction={transaction}
          onClose={() => setShowReceiptPreview(false)}
        />
      )}
    </div>
  );
}; 