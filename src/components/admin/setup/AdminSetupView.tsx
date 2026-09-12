'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Lock, RefreshCw, Rocket } from 'lucide-react'

export function AdminSetupView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const checkSetup = useCallback(async () => {
    setLoading(true)
    setInitError(null)
    try {
      const res = await fetch('/api/auth/setup-admin', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to check admin setup status.')
      }
      setSetupRequired(Boolean(data.setupRequired))
    } catch (err) {
      setInitError(
        err instanceof Error
          ? err.message
          : 'Error connecting to database. Please check your connection and retry.'
      )
      setSetupRequired(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void checkSetup()
  }, [checkSetup])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Setup failed.')
      }
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Setup failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-500">Checking store initialization state...</p>
      </div>
    )
  }

  if (initError || setupRequired === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-xl text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Database Connection Issue</h1>
          <p className="text-sm text-slate-600">
            {initError || 'Unable to verify store initialization status.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => void checkSetup()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry Connection
            </Button>
            <Button variant="outline" onClick={() => router.push('/')} className="w-full font-medium">
              Back to Storefront
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (setupRequired === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-4">
          <div className="flex justify-center">
            <Lock className="h-10 w-10 text-slate-400" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Setup Already Completed</h1>
          <p className="text-sm text-slate-600">
            An administrator account already exists for this CTools store deployment.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button onClick={() => router.push('/login')} className="w-full bg-slate-900 text-white font-bold">
              Proceed to Login
            </Button>
            <Button variant="outline" onClick={() => router.push('/')} className="w-full font-medium">
              Back to Storefront
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 font-mono">
            Initial Setup
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Create First Administrator</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Welcome to CTools Ecommerce. Please register the primary merchant administrator account for this store.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {errorMsg}
          </div>
        )}

        <form method="POST" onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Administrator Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Store Manager"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Administrator Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@ctools.store"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Secure Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl mt-2 inline-flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Initializing Admin Account...'
            ) : (
              <>
                <Rocket className="h-4 w-4" aria-hidden="true" />
                Create Admin & Enter Console
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
