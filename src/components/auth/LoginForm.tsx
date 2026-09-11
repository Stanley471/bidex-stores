'use client'

 import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { LoginSchema } from '@/lib/auth/validation'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'

interface LoginFormProps {
  redirectTo?: string | null
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const parsed = LoginSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      setErrors({
        email: fieldErrors.email?.[0] ?? '',
        password: fieldErrors.password?.[0] ?? '',
      })
      return
    }

    setIsSubmitting(true)
    setServerMessage(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to sign in.')
      }

      let targetDestination = data.user?.role === 'ADMIN' ? '/admin' : '/dashboard'

      if (redirectTo && redirectTo.startsWith('/')) {
        if (redirectTo.startsWith('/admin') && data.user?.role !== 'ADMIN') {
          targetDestination = '/dashboard'
        } else {
          targetDestination = redirectTo
        }
      }

      router.push(targetDestination)
      router.refresh()
    } catch (error) {
      setServerMessage(error instanceof Error ? error.message : 'Unable to sign in.')
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
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
        {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
      </div>

      <div className="space-y-1">
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-brand-primary hover:text-brand-secondary transition hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {serverMessage ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverMessage}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-primary hover:bg-brand-secondary px-4 py-3 text-sm font-bold text-white shadow-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 uppercase tracking-wider"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <GoogleLoginButton />
    </form>
  )
}
