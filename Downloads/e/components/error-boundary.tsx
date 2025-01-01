'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
        <p className="text-sm text-gray-500">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
} 