'use client';

import React, { useState } from 'react';
import { ReconciledItem } from '@/types';
import { FileText } from 'lucide-react';

interface ReportButtonProps {
  items: ReconciledItem[];
  type: 'personal' | 'business';
}

export const ReportButton: React.FC<ReportButtonProps> = ({ items, type }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const filteredItems = items.filter(item => 
        type === 'personal' ? item.isPersonal : !item.isPersonal
      );

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: filteredItems,
          type
        })
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-expense-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Failed to generate report:', error);
      // TODO: Add error notification here
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateReport}
      disabled={isGenerating}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg
        ${type === 'personal' 
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Generate {type === 'personal' ? 'Personal' : 'Business'} Report
        </>
      )}
    </button>
  );
}; 