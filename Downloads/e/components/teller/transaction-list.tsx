'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatementEntry, Receipt } from '@prisma/client'
import { formatCurrency } from '@/lib/utils'
import { Search, Filter } from 'lucide-react'

type Transaction = StatementEntry & {
  receipt?: Receipt | null
}

interface TransactionListProps {
  transactions: Transaction[]
  onSelectTransaction: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onSelectTransaction }: TransactionListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredTransactions = transactions
    .filter(transaction => {
      // Apply search
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.amount.toString().includes(searchLower)
        )
      }
      return true
    })
    .filter(transaction => {
      // Apply match status filter
      if (filter === 'matched') return transaction.receipt
      if (filter === 'unmatched') return !transaction.receipt
      return true
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return sortOrder === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount
      }
    })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select
          value={filter}
          onValueChange={(value: typeof filter) => setFilter(value)}
        >
          <option value="all">All Transactions</option>
          <option value="matched">Matched</option>
          <option value="unmatched">Unmatched</option>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(value: typeof sortBy) => setSortBy(value)}
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
        >
          <Filter className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <div className="space-y-2">
        {filteredTransactions.map(transaction => (
          <Card
            key={transaction.id}
            className="p-4 hover:bg-accent cursor-pointer"
            onClick={() => onSelectTransaction(transaction)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm">
                  {transaction.receipt ? (
                    <span className="text-green-600">Matched</span>
                  ) : (
                    <span className="text-yellow-600">Unmatched</span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {filteredTransactions.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No transactions found
          </p>
        )}
      </div>
    </div>
  )
} 