'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AuthError() {
  const router = useRouter()

  useEffect(() => {
    console.error('Authentication error')
  }, [])

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Authentication Error</h2>
        <p className="text-sm text-muted-foreground">
          Please sign in to continue
        </p>
      </div>
      <Button onClick={() => router.push('/sign-in')}>
        Sign In
      </Button>
    </div>
  )
} 