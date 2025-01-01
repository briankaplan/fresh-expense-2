import { ClientLayout } from '@/components/layout/client-layout'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  )
} 