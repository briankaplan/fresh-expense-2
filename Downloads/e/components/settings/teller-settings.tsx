'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { ConnectButton } from '@/components/teller/connect-button'

interface TellerSettings {
  autoSync: boolean
  syncInterval: number // in hours
  defaultCategory?: string
  enabled: boolean
}

export function TellerSettings() {
  const [settings, setSettings] = useState<TellerSettings>({
    autoSync: true,
    syncInterval: 24,
    enabled: false
  })
  const [loading, setLoading] = useState(false)

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/teller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (!response.ok) throw new Error('Failed to save settings')
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Settings error:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Connection Settings</CardTitle>
        <CardDescription>
          Configure your bank account synchronization settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-medium">Enable Bank Sync</h3>
            <p className="text-sm text-muted-foreground">
              Automatically sync transactions from your bank accounts
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings(s => ({ ...s, enabled: checked }))}
          />
        </div>

        {settings.enabled && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium">Auto Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically sync new transactions
                </p>
              </div>
              <Switch
                checked={settings.autoSync}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, autoSync: checked }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sync Interval (hours)</label>
              <Input
                type="number"
                min="1"
                max="168"
                value={settings.syncInterval}
                onChange={(e) => setSettings(s => ({ 
                  ...s, 
                  syncInterval: parseInt(e.target.value) || 24 
                }))}
              />
            </div>

            <div className="pt-4">
              <ConnectButton
                onSuccess={(enrollmentId) => {
                  toast.success('Bank account connected')
                  setSettings(s => ({ ...s, enabled: true }))
                }}
                onExit={() => {
                  console.log('Connection cancelled')
                }}
              />
            </div>
          </>
        )}

        <Button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full"
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
} 