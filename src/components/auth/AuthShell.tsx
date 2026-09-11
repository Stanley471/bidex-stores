import type { ReactNode } from 'react'

interface AuthShellProps {
  children: ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/60 px-4 py-4 sm:py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md">
          {children}
        </div>
      </div>
    </div>
  )
}
