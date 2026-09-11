import type { ReactNode } from 'react'
import { AuthShell } from '@/components/auth/AuthShell'
import { GuestOnlyGuard } from '@/components/auth/GuestOnlyGuard'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <GuestOnlyGuard>
      <AuthShell>
        {children}
      </AuthShell>
    </GuestOnlyGuard>
  )
}

