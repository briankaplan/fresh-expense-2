'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface ConnectButtonProps {
  onSuccess: (enrollmentId: string) => void
  onExit: () => void
}

declare global {
  interface Window {
    Teller: any
  }
}

export function ConnectButton({ onSuccess, onExit }: ConnectButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)

    try {
      const { Teller } = window
      if (!Teller) {
        throw new Error('Teller Connect not loaded')
      }

      const tellerConnect = Teller.configure({
        applicationId: process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID!,
        environment: process.env.NEXT_PUBLIC_TELLER_ENVIRONMENT || 'sandbox',
        onSuccess: async (enrollment: any) => {
          try {
            const response = await fetch('/api/teller/enroll', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                enrollmentId: enrollment.enrollment_id,
                institutionId: enrollment.institution.id,
                accessToken: enrollment.accessToken
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to save enrollment')
            }

            onSuccess(enrollment.enrollment_id)
            toast.success('Bank account connected successfully')
          } catch (error) {
            console.error('Failed to save enrollment:', error)
            toast.error('Failed to connect bank account')
          }
        },
        onExit: () => {
          onExit()
        },
        onEvent: (event: any) => {
          console.log('Teller event:', event)
        },
        options: {
          selectAccount: 'all',
          accountFilters: {
            status: ['open'],
            types: ['depository', 'credit'],
          },
        }
      })

      tellerConnect.open()
    } catch (error) {
      console.error('Connect error:', error)
      toast.error('Failed to initialize Teller Connect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleConnect} disabled={loading}>
      {loading ? 'Connecting...' : 'Connect Bank Account'}
    </Button>
  )
} 