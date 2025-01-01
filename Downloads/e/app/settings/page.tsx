import { Suspense } from 'react'
import { TellerSettings } from '@/components/settings/teller-settings'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and integration settings
          </p>
        </div>

        <div className="grid gap-8">
          <Suspense fallback={<Skeleton className="h-[300px]" />}>
            <TellerSettings />
          </Suspense>

          {/* Add other settings sections here */}
        </div>
      </div>
    </div>
  )
} 