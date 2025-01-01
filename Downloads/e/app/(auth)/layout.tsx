import { ClerkProvider } from '@clerk/nextjs'
import { ClientLayout } from '@/components/layout/client-layout'
import { Header } from '@/components/layout/header'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <ClientLayout>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </ClientLayout>
    </ClerkProvider>
  )
} 