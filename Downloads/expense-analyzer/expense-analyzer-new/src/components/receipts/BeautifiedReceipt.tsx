'use client';

import React from 'react';
import { OCRResult } from '@/types';

interface BeautifiedReceiptProps {
  data: OCRResult;
  imageUrl?: string;
}

export const BeautifiedReceipt: React.FC<BeautifiedReceiptProps> = ({
  data,
  imageUrl
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {imageUrl && (
        <div className="mb-6">
          <img 
            src={imageUrl} 
            alt="Receipt" 
            className="w-full rounded-lg shadow"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{data.merchant}</h3>
          <p className="text-sm text-gray-600">{data.date}</p>
        </div>

        {data.items && data.items.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Items</h4>
            <div className="space-y-2">
              {data.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.description}</span>
                  <span className="font-medium">
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          {data.tax && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${data.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${data.total.toFixed(2)}</span>
          </div>
        </div>

        {data.confidence < 1 && (
          <div className="mt-4 text-sm text-yellow-600">
            ⚠️ OCR Confidence: {Math.round(data.confidence * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}; 