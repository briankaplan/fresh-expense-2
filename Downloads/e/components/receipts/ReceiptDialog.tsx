'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ReceiptDialogProps {
  open: boolean
  onClose: () => void
  receipt: any
  onFindMatches: () => void
}

export function ReceiptDialog({ open, onClose, receipt, onFindMatches }: ReceiptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Receipt Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-[4/5] relative">
            <img 
              src={receipt?.fileUrl} 
              alt="Receipt"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Details</h3>
              <p>Amount: ${receipt?.amount?.toFixed(2)}</p>
              <p>Date: {receipt?.date ? new Date(receipt.date).toLocaleDateString() : 'N/A'}</p>
              <p>Merchant: {receipt?.merchant || 'N/A'}</p>
              <p>Category: {receipt?.category || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>Processing: {receipt?.status}</p>
              <p>Confidence: {(receipt?.confidence * 100).toFixed(1)}%</p>
              <p>Matched: {receipt?.statementEntryId ? 'Yes' : 'No'}</p>
            </div>
          </div>
          {!receipt?.statementEntryId && (
            <Button onClick={onFindMatches} className="w-full">
              Find Matches
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 