'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { GmailAccountCard } from '@/components/settings/gmail-account-card'
import { useUser } from '@clerk/nextjs'
import { GmailAccount } from '@/types'
import toast from 'react-hot-toast'

export default function IntegrationsPage() {
  const { user } = useUser()
  const [accounts, setAccounts] = useState<GmailAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`/api/gmail/accounts?userId=${user?.id}`)
      const data = await response.json()
      setAccounts(data.accounts)
    } catch (error) {
      toast.error('Failed to fetch accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/gmail/auth/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error('Failed to connect Gmail account')
    }
  }

  const handleDisconnect = async (accountId: string) => {
    try {
      await fetch(`/api/gmail/accounts/${accountId}`, {
        method: 'DELETE'
      })
      toast.success('Account disconnected')
      fetchAccounts()
    } catch (error) {
      toast.error('Failed to disconnect account')
    }
  }

  const handleSync = async (accountId: string) => {
    try {
      await fetch(`/api/gmail/accounts/${accountId}/sync`, {
        method: 'POST'
      })
      toast.success('Sync completed')
      fetchAccounts()
    } catch (error) {
      throw new Error('Sync failed')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Email Integrations</h1>
          <p className="text-gray-600">Connect your email accounts to automatically find receipts</p>
        </div>
        <Button onClick={handleConnect}>
          Connect Gmail Account
        </Button>
      </div>

      {isLoading ? (
        <div>Loading accounts...</div>
      ) : (
        <div className="space-y-4">
          {accounts.map(account => (
            <GmailAccountCard
              key={account.id}
              account={account}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
            />
          ))}
          {accounts.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No email accounts connected yet
            </p>
          )}
        </div>
      )}
    </div>
  )
} 