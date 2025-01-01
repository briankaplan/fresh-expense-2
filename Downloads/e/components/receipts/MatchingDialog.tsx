'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'

interface MatchingDialogProps {
  open: boolean
  onClose: () => void
  receipt: any
  matches: any[]
  onMatch: (statementEntryId: string) => Promise<void>
}

const columns = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString()
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => `$${row.original.amount.toFixed(2)}`
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => row.original.onMatch(row.original.id)}
        >
          Match
        </Button>
      )
    }
  }
]

export function MatchingDialog({ open, onClose, receipt, matches, onMatch }: MatchingDialogProps) {
  const [isMatching, setIsMatching] = useState(false)

  const handleMatch = async (statementEntryId: string) => {
    setIsMatching(true)
    try {
      await onMatch(statementEntryId)
      onClose()
    } catch (error) {
      console.error('Error matching receipt:', error)
    } finally {
      setIsMatching(false)
    }
  }

  const tableData = matches.map(match => ({
    ...match,
    onMatch: handleMatch
  }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Match Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Receipt Details</h3>
              <p>Amount: ${receipt?.amount?.toFixed(2)}</p>
              <p>Date: {receipt?.date ? new Date(receipt.date).toLocaleDateString() : 'N/A'}</p>
              <p>Merchant: {receipt?.merchant || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Potential Matches</h3>
            <DataTable 
              columns={columns}
              data={tableData}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 