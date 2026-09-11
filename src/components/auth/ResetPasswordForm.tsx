'use client'

import { useState } from 'react'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { ResetPasswordSchema } from '@/lib/auth/validation'

interface ResetPasswordFormProps {
  token?: string
}

export function ResetPasswordForm({ token = '' }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const parsed = ResetPasswordSchema.safeParse({ token, password })
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.password?.[0] ?? 'Please provide a valid reset token and password.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMessage('Password reset flow is ready for your backend integration.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form method="POST" className="space-y-4" onSubmit={handleSubmit} noValidate>
      <PasswordInput
        id="password"
        name="password"
        label="New password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={error ?? undefined}
        autoComplete="new-password"
      />

      {message ? <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}
