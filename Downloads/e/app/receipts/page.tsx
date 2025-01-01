'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Card } from '@/components/ui/card'
import { Search } from '@/components/ui/search'
import { ReceiptDialog } from '@/components/receipts/ReceiptDialog'
import { MatchingDialog } from '@/components/receipts/MatchingDialog'

interface Receipt {
  id: string
  date: string
  merchant: string
  amount: number
  category: string
  status: 'processed' | 'pending' | 'failed'
  imageUrl: string
}

const columns = [
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'merchant',
    header: 'Merchant',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      return <div className="font-medium">
        ${row.original.amount.toFixed(2)}
      </div>
    }
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${status === 'processed' ? 'bg-green-100 text-green-800' : 
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'}`}>
          {status}
        </div>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedReceipt(row.original)}
          >
            View
          </Button>
        </div>
      )
    }
  }
]

export default function ReceiptsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [showMatching, setShowMatching] = useState(false)
  const [matches, setMatches] = useState([])

  const handleFindMatches = async () => {
    if (!selectedReceipt) return

    try {
      const response = await fetch(`/api/receipts/search/matches?receiptId=${selectedReceipt.id}`)
      const data = await response.json()
      setMatches(data.matches)
      setShowMatching(true)
    } catch (error) {
      console.error('Error finding matches:', error)
    }
  }

  const handleMatch = async (statementEntryId: string) => {
    try {
      const response = await fetch('/api/receipts/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: selectedReceipt.id,
          statementEntryId
        })
      })
      
      if (!response.ok) throw new Error('Failed to match receipt')
      
      // Refresh receipt data
      // TODO: Implement data refresh
    } catch (error) {
      console.error('Error matching receipt:', error)
      throw error
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receipts</h1>
        <Button>Upload Receipt</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Total Receipts</h3>
          <p className="text-2xl font-bold">0</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">This Month</h3>
          <p className="text-2xl font-bold">0</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Pending Processing</h3>
          <p className="text-2xl font-bold">0</p>
        </Card>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Receipt History</h2>
            <div className="flex items-center gap-2">
              <Search 
                placeholder="Search receipts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>
          <DataTable 
            columns={columns}
            data={[]} // Add your receipt data here
          />
        </div>
      </Card>

      {selectedReceipt && (
        <ReceiptDialog
          open={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          receipt={selectedReceipt}
          onFindMatches={handleFindMatches}
        />
      )}

      {showMatching && selectedReceipt && (
        <MatchingDialog
          open={showMatching}
          onClose={() => setShowMatching(false)}
          receipt={selectedReceipt}
          matches={matches}
          onMatch={handleMatch}
        />
      )}
    </div>
  )
} 