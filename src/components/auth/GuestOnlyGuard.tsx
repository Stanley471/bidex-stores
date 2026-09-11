'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface GuestOnlyGuardProps {
  children: ReactNode
}

export function GuestOnlyGuard({ children }: GuestOnlyGuardProps) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'same-origin',
          cache: 'no-store',
        })

        if (response.ok) {
          const data = await response.json()
          if (data?.user && isMounted) {
            setIsAuthenticated(true)
            const target = data.user.role === 'ADMIN' ? '/admin' : '/dashboard'
            router.replace(target)
            return
          }
        }
      } catch {
        // Unauthenticated -> allow access
      } finally {
        if (isMounted) {
          setChecking(false)
        }
      }
    }

    void checkSession()

    return () => {
      isMounted = false
    }
  }, [router])

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}
