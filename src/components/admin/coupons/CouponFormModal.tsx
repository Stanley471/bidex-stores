'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export interface CouponItem {
  id?: string
  code: string
  description?: string | null
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minimumOrderAmount?: number | null
  maximumDiscount?: number | null
  usageLimit?: number | null
  usedCount?: number
  perUserLimit?: number | null
  startsAt?: string | null
  expiresAt?: string | null
  isActive: boolean
}

interface CouponFormModalProps {
  isOpen: boolean
  initialData?: CouponItem | null
  onClose: () => void
  onSuccess: () => void
}

export function CouponFormModal({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}: CouponFormModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currencySymbol, setCurrencySymbol] = useState('₦')

  useEffect(() => {
    async function loadCurrency() {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        if (res.ok && data.success && data.settings?.currencySymbol) {
          setCurrencySymbol(data.settings.currencySymbol)
        }
      } catch {
        // Fallback default retained
      }
    }
    void loadCurrency()
  }, [])

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState('')
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('')
  const [maximumDiscount, setMaximumDiscount] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [perUserLimit, setPerUserLimit] = useState('1')
  const [startsAt, setStartsAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let ignore = false
    async function initForm() {
      if (ignore) return
      if (initialData) {
        setCode(initialData.code)
        setDescription(initialData.description || '')
        setDiscountType(initialData.discountType)
        setDiscountValue(String(initialData.discountValue))
        setMinimumOrderAmount(initialData.minimumOrderAmount ? String(initialData.minimumOrderAmount) : '')
        setMaximumDiscount(initialData.maximumDiscount ? String(initialData.maximumDiscount) : '')
        setUsageLimit(initialData.usageLimit ? String(initialData.usageLimit) : '')
        setPerUserLimit(initialData.perUserLimit ? String(initialData.perUserLimit) : '1')
        setStartsAt(initialData.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 16) : '')
        setExpiresAt(initialData.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : '')
        setIsActive(initialData.isActive)
      } else {
        setCode('')
        setDescription('')
        setDiscountType('PERCENTAGE')
        setDiscountValue('')
        setMinimumOrderAmount('')
        setMaximumDiscount('')
        setUsageLimit('')
        setPerUserLimit('1')
        setStartsAt('')
        setExpiresAt('')
        setIsActive(true)
      }
      setError(null)
    }
    initForm()
    return () => {
      ignore = true
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        minimumOrderAmount: minimumOrderAmount ? Number(minimumOrderAmount) : undefined,
        maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        isActive,
      }

      const isEditing = Boolean(initialData?.id)
      const url = isEditing ? `/api/admin/coupons/${initialData?.id}` : '/api/admin/coupons'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save coupon.')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save coupon.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl my-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-slate-700">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SAVE20"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase font-mono font-bold focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white font-medium"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ({currencySymbol})</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Value * {discountType === 'PERCENTAGE' ? '(%)' : `(${currencySymbol})`}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 10.00'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Order Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
                placeholder="e.g. 50.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {discountType === 'PERCENTAGE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Discount Cap ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={maximumDiscount}
                onChange={(e) => setMaximumDiscount(e.target.value)}
                placeholder="Optional max cap for percentage discounts"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20% discount on all store items"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Global Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited if left empty"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Per-User Limit
              </label>
              <input
                type="number"
                min="1"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                placeholder="e.g. 1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiration Date & Time
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="font-semibold text-slate-900">Active (Available for checkout)</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
