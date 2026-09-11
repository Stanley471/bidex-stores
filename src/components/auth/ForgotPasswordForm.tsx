'use client'

import { useState } from 'react'
import { ForgotPasswordSchema } from '@/lib/auth/validation'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const parsed = ForgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0] ?? 'Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMessage('If this account exists, a reset email will be sent shortly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form method="POST" className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>

      {message ? <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  )
}
