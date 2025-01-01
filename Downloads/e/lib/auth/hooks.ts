import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

export function useRequireAuth(redirectTo = '/sign-in') {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    } else if (user) {
      setIsAuthorized(true)
    }
  }, [user, loading, redirectTo, router])

  return { user, loading, isAuthorized }
} 