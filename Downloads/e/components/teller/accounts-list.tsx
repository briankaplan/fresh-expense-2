'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { TransactionDetails } from './transaction-details'
import { TransactionList } from './transaction-list'

interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  institution: string
  lastFour: string | null
  transactions?: StatementEntry[]
}

export function AccountsList({ accounts }: { accounts: Account[] }) {
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  const handleSync = async (accountId: string) => {
    setSyncingAccount(accountId)
    try {
      const response = await fetch(`/api/teller/accounts/${accountId}/sync`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Synced ${data.transactionCount} transactions`)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Failed to sync transactions')
      console.error(error)
    } finally {
      setSyncingAccount(null)
    }
  }

  return (
    <div className="space-y-4">
      {accounts.map(account => (
        <Card key={account.id} className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="font-medium">{account.name}</h3>
              <p className="text-sm text-muted-foreground">
                {account.institution} •••• {account.lastFour}
              </p>
              <p className="text-sm">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: account.currency
                }).format(account.balance)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAccount(
                  selectedAccount === account.id ? null : account.id
                )}
              >
                {selectedAccount === account.id ? 'Hide' : 'View'} Transactions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync(account.id)}
                disabled={syncingAccount === account.id}
              >
                {syncingAccount === account.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync'
                )}
              </Button>
            </div>
          </div>

          {selectedAccount === account.id && account.transactions && (
            <div className="mt-4 pt-4 border-t">
              <TransactionList
                transactions={account.transactions}
                onSelectTransaction={setSelectedTransaction}
              />
            </div>
          )}
        </Card>
      ))}

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onMatch={async (receiptId) => {
            const response = await fetch(
              `/api/transactions/${selectedTransaction.id}/match`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiptId })
              }
            )
            if (!response.ok) throw new Error('Failed to match')
          }}
        />
      )}
    </div>
  )
} 