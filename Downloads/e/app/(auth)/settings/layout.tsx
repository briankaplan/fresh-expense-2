import { Sidebar } from '@/components/settings/sidebar'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container py-8">
      <div className="flex gap-8">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
} 