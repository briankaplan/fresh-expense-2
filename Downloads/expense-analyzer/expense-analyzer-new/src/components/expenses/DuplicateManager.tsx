'use client';

import React from 'react';
import { ReconciledItem } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDateDisplay } from '@/utils/dates';
import { X, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import styles from './DuplicateManager.module.css';

interface DuplicateManagerProps {
  items: ReconciledItem[];
  onMerge: (items: ReconciledItem[]) => void;
  onClose: () => void;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  items,
  onMerge,
  onClose
}) => {
  if (!items.length) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 ${styles.customAnimation}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Potential Duplicates Found</h3>
              <p className="text-sm text-gray-600">
                {items.length} similar transactions detected
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className={`
                p-4 rounded-lg border
                ${index === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {item.description}
                    </p>
                    {index === 0 && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDateDisplay(item.date)}
                  </p>
                  {item.category && (
                    <p className="text-sm text-gray-500 mt-1">
                      Category: {item.category}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </p>
                  {item.hasReceipt && (
                    <span className="text-xs text-green-600 mt-1">
                      Has Receipt
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="text-right">
              <p className="text-sm text-gray-600">After Merge</p>
              <p className="text-lg font-semibold">
                {formatCurrency(items[0]?.amount || 0)}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => onMerge(items)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Merge Duplicates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 