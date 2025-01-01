'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CategorySelector } from './category-selector'
import { TagInput } from './tag-input'
import { Receipt, StatementEntry } from '@prisma/client'
import { toast } from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface TransactionDetailsProps {
  transaction: StatementEntry & {
    receipt?: Receipt | null
  }
  onClose: () => void
  onMatch: (receiptId: string) => Promise<void>
}

export function TransactionDetails({ transaction, onClose, onMatch }: TransactionDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [suggestedReceipts, setSuggestedReceipts] = useState<Receipt[]>([])
  const [category, setCategory] = useState(transaction.category || '')
  const [tags, setTags] = useState<Tag[]>(transaction.tags || [])

  const loadSuggestedReceipts = async () => {
    try {
      const response = await fetch(`/api/receipts/search?amount=${transaction.amount}&date=${transaction.date}`)
      const data = await response.json()
      setSuggestedReceipts(data.receipts)
    } catch (error) {
      console.error('Failed to load suggestions:', error)
      toast.error('Failed to load receipt suggestions')
    }
  }

  const handleMatch = async (receiptId: string) => {
    setLoading(true)
    try {
      await onMatch(receiptId)
      toast.success('Receipt matched successfully')
      onClose()
    } catch (error) {
      console.error('Match error:', error)
      toast.error('Failed to match receipt')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCategory = async (newCategory: string) => {
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      })
      if (!response.ok) throw new Error('Failed to update category')
      setCategory(newCategory)
      toast.success('Category updated')
    } catch (error) {
      toast.error('Failed to update category')
      console.error(error)
    }
  }

  const handleAddTag = async (tagName: string) => {
    try {
      const response = await fetch(`/api/transactions/${transaction.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName })
      })
      if (!response.ok) throw new Error('Failed to add tag')
      const newTag = await response.json()
      setTags([...tags, newTag])
      toast.success('Tag added')
    } catch (error) {
      toast.error('Failed to add tag')
      console.error(error)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
              <p className="text-lg font-semibold">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
              <p className="text-lg">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
            <p>{transaction.description}</p>
          </div>

          {transaction.receipt ? (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Matched Receipt</h4>
              <div className="border rounded-lg p-4">
                <p className="font-medium">{transaction.receipt.merchant}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(transaction.receipt.amount || 0)}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-muted-foreground">Suggested Receipts</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadSuggestedReceipts}
                >
                  Find Matches
                </Button>
              </div>

              {suggestedReceipts.length > 0 ? (
                <div className="space-y-4">
                  {suggestedReceipts.map(receipt => (
                    <div 
                      key={receipt.id}
                      className="border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{receipt.merchant}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(receipt.amount || 0)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={loading}
                        onClick={() => handleMatch(receipt.id)}
                      >
                        Match
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No matching receipts found
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Category</h4>
              <CategorySelector value={category} onChange={handleUpdateCategory} />
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
              <TagInput
                tags={tags}
                onAddTag={handleAddTag}
                onRemoveTag={(tagId) => {
                  // Handle tag removal
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 