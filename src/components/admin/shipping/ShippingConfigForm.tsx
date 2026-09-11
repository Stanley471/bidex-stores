'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface ShippingConfigData {
  id: string
  type: 'FREE' | 'FLAT_RATE' | 'NEGOTIABLE'
  fee: number
  isActive: boolean
  updatedAt: string
}

export function ShippingConfigForm() {
  const [config, setConfig] = useState<ShippingConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currencySymbol, setCurrencySymbol] = useState('$')

  // Form fields
  const [type, setType] = useState<'FREE' | 'FLAT_RATE' | 'NEGOTIABLE'>('FLAT_RATE')
  const [fee, setFee] = useState<string>('0')

  useEffect(() => {
    let ignore = false
    async function loadConfig() {
      try {
        const [shippingRes, settingsRes] = await Promise.all([
          fetch('/api/admin/shipping'),
          fetch('/api/settings/public'),
        ])
        const [shippingData, settingsData] = await Promise.all([
          shippingRes.json(),
          settingsRes.json(),
        ])
        if (!ignore) {
          if (shippingRes.ok && shippingData.success) {
            setConfig(shippingData.config)
            setType(shippingData.config.type)
            setFee(String(shippingData.config.fee))
          } else {
            setError(shippingData.message || 'Failed to load shipping settings.')
          }
          if (settingsRes.ok && settingsData.success && settingsData.settings?.currencySymbol) {
            setCurrencySymbol(settingsData.settings.currencySymbol)
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unable to load shipping settings.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    loadConfig()
    return () => {
      ignore = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const numFee = Number(fee)
      if (type === 'FLAT_RATE' && (Number.isNaN(numFee) || numFee < 0)) {
        throw new Error('Please enter a valid non-negative flat-rate fee.')
      }

      const res = await fetch('/api/admin/shipping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          fee: type === 'FLAT_RATE' ? numFee : 0,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update shipping settings.')
      }

      setConfig(data.config)
      setSuccess('Shipping settings updated successfully!')
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save shipping settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Loading shipping settings...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Active Shipping Configuration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose how shipping rates are calculated across the store during customer checkout.
          </p>
        </div>

        <div className="space-y-3">
          {/* 1. Free Shipping */}
          <label
            onClick={() => setType('FREE')}
            className={`flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition ${
              type === 'FREE'
                ? 'border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="shippingType"
              value="FREE"
              checked={type === 'FREE'}
              onChange={() => setType('FREE')}
              className="mt-1 h-4 w-4 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <p className="font-bold text-sm text-slate-900">Free Shipping</p>
              <p className="text-xs text-slate-500 mt-0.5">
                No shipping fee charged to customers ({currencySymbol}0.00).
              </p>
            </div>
          </label>

          {/* 2. Flat Rate */}
          <label
            onClick={() => setType('FLAT_RATE')}
            className={`flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition ${
              type === 'FLAT_RATE'
                ? 'border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="shippingType"
              value="FLAT_RATE"
              checked={type === 'FLAT_RATE'}
              onChange={() => setType('FLAT_RATE')}
              className="mt-1 h-4 w-4 text-slate-900 focus:ring-slate-900"
            />
            <div className="flex-1 space-y-2">
              <div>
                <p className="font-bold text-sm text-slate-900">Flat Rate Shipping</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fixed shipping fee applied to all orders.
                </p>
              </div>

              {type === 'FLAT_RATE' && (
                <div className="pt-2 max-w-xs">
                  <label className="block text-xs font-semibold text-slate-700">Flat Fee Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="e.g. 15.00"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </label>

          {/* 3. Negotiable Shipping */}
          <label
            onClick={() => setType('NEGOTIABLE')}
            className={`flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition ${
              type === 'NEGOTIABLE'
                ? 'border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/10'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="shippingType"
              value="NEGOTIABLE"
              checked={type === 'NEGOTIABLE'}
              onChange={() => setType('NEGOTIABLE')}
              className="mt-1 h-4 w-4 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <p className="font-bold text-sm text-slate-900">Negotiable Shipping</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Shipping fee is marked as &quot;To be confirmed&quot;. Store representative contacts customer to arrange delivery.
              </p>
            </div>
          </label>
        </div>

        {config && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Current Status:</span> Active mode is{' '}
            <span className="font-bold text-slate-900">{config.type}</span>{' '}
            {config.type === 'FLAT_RATE' ? `(${currencySymbol}${Number(config.fee).toFixed(2)})` : ''}.
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Shipping Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
