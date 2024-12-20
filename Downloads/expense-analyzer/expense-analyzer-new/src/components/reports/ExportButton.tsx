'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import type { Report } from '@/types';
import { formatDateDisplay } from '@/utils/dates';

interface Props {
  report: Report;
  className?: string;
}

export const ExportButton: React.FC<Props> = ({ report, className }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Format data for export
      const personalTransactions = report.bankTransactions
        .filter(tx => tx.type === 'personal')
        .map(tx => ({
          Date: formatDateDisplay(tx.date),
          Description: tx.description,
          Amount: Math.abs(tx.amount).toFixed(2),
          'Has Receipt': tx.hasReceipt ? 'Yes' : 'No',
          'Receipt URL': tx.receiptUrl || ''
        }));

      const businessTransactions = report.bankTransactions
        .filter(tx => tx.type === 'business')
        .map(tx => ({
          Date: formatDateDisplay(tx.date),
          Description: tx.description,
          Amount: Math.abs(tx.amount).toFixed(2),
          'Has Receipt': tx.hasReceipt ? 'Yes' : 'No',
          'Receipt URL': tx.receiptUrl || ''
        }));

      // Create CSV content
      const personalCsv = convertToCSV(personalTransactions);
      const businessCsv = convertToCSV(businessTransactions);

      // Create zip file
      const zip = new JSZip();
      zip.file('personal_transactions.csv', personalCsv);
      zip.file('business_transactions.csv', businessCsv);

      // Add receipts list
      const missingReceipts = report.bankTransactions
        .filter(tx => !tx.hasReceipt && tx.amount >= 75)
        .map(tx => ({
          Date: formatDateDisplay(tx.date),
          Description: tx.description,
          Amount: Math.abs(tx.amount).toFixed(2)
        }));
      zip.file('missing_receipts.csv', convertToCSV(missingReceipts));

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-report-${formatDateDisplay(new Date(report.date))}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report exported successfully');
    } catch (err) {
      console.error('Failed to export report:', err);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-green-600 text-white rounded-lg
        hover:bg-green-700 
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      <Download className="w-4 h-4" />
      {isExporting ? 'Exporting...' : 'Export Report'}
    </button>
  );
};

function convertToCSV(data: Record<string, string>[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ];
  
  return rows.join('\n');
} 