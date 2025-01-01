'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GmailAccount } from '@/types'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface GmailAccountCardProps {
  account: GmailAccount
  onDisconnect: (accountId: string) => Promise<void>
  onSync: (accountId: string) => Promise<void>
}

export function GmailAccountCard({ 
  account, 
  onDisconnect, 
  onSync 
}: GmailAccountCardProps) {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await onSync(account.id)
      toast.success('Sync completed')
    } catch (error) {
      toast.error('Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{account.email}</p>
          <p className="text-sm text-gray-500">
            Last synced: {new Date(account.lastSync).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              'Sync Now'
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDisconnect(account.id)}
            disabled={isSyncing}
          >
            Disconnect
          </Button>
        </div>
      </div>
    </Card>
  )
} 