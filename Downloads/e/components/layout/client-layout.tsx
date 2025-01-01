'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background font-sans antialiased">
        {children}
      </div>
      <Toaster />
    </ThemeProvider>
  )
} 