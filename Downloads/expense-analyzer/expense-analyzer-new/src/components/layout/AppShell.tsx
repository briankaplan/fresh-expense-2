'use client';

import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }} 
      />
    </SWRConfig>
  );
} 