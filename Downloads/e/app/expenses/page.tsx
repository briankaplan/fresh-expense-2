'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'

interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  hasReceipt: boolean
}

const columns = [
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'category',
    header: 'Category',
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
    accessorKey: 'hasReceipt',
    header: 'Receipt',
    cell: ({ row }) => {
      return <div className={row.original.hasReceipt ? 'text-green-500' : 'text-red-500'}>
        {row.original.hasReceipt ? '✓' : '✗'}
      </div>
    }
  }
]

export default function ExpensesPage() {
  const [period, setPeriod] = useState('month')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex gap-2">
          <Button 
            variant={period === 'month' ? 'default' : 'ghost'}
            onClick={() => setPeriod('month')}
          >
            Month
          </Button>
          <Button 
            variant={period === 'year' ? 'default' : 'ghost'}
            onClick={() => setPeriod('year')}
          >
            Year
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Recent Expenses</h2>
            <Button variant="outline" size="sm">Export</Button>
          </div>
          <DataTable 
            columns={columns}
            data={[]} // Add your expense data here
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-4">Expense Categories</h2>
            {/* Add categories chart here */}
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold mb-4">Monthly Trend</h2>
            {/* Add trend chart here */}
          </div>
        </div>
      </div>
    </div>
  )
} 