import type { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
  description?: string
}

export function AuthCard({ children, description }: AuthCardProps) {
  return (
    <div className="space-y-4">
      {description ? (
        <p className="text-sm font-medium text-slate-600 text-center mb-2">{description}</p>
      ) : null}
      {children}
    </div>
  )
}
