'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { calculateOrderTotals } from '@/services/checkout.service'
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency'

interface CheckoutSummaryProps {
  selectedAddressId: string | null
  paymentMethod: string
  notes: string
}

interface ShippingCalculation {
  type: 'FREE' | 'FLAT_RATE' | 'NEGOTIABLE'
  fee: number
  isNegotiable: boolean
  label: string
}

export function CheckoutSummary({
  selectedAddressId,
  paymentMethod,
  notes,
}: CheckoutSummaryProps) {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [loadingStep, setLoadingStep] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currencyCode, setCurrencyCode] = useState('NGN')

  useEffect(() => {
    async function loadCurrency() {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        if (res.ok && data.success && data.settings?.currencyCode) {
          setCurrencyCode(data.settings.currencyCode)
        }
      } catch {
        // Fallback default retained
      }
    }
    void loadCurrency()
  }, [])

  const fmtCurrency = (val: number) => formatCurrencyUtil(val, currencyCode)

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
  } | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  // Shipping calculation state
  const [shippingInfo, setShippingInfo] = useState<ShippingCalculation>({
    type: 'FLAT_RATE',
    fee: 0,
    isNegotiable: false,
    label: 'Calculating...',
  })

  useEffect(() => {
    let ignore = false
    async function loadShippingCalc() {
      try {
        const res = await fetch(`/api/shipping/calculate?subtotal=${cart.summary.subtotal}`)
        const data = await res.json()
        if (!ignore && res.ok && data.success) {
          setShippingInfo(data.calculation)
        }
      } catch {
        // Fallback
      }
    }
    loadShippingCalc()
    return () => {
      ignore = true
    }
  }, [cart.summary.subtotal])

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const totals = calculateOrderTotals(
    cart.summary.subtotal,
    discountAmount,
    shippingInfo.fee,
    0,
  )

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCodeInput.trim()) return

    setValidatingCoupon(true)
    setCouponError(null)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCodeInput.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid coupon code.')
      }

      setAppliedCoupon({
        code: data.data.coupon.code,
        discountAmount: data.data.discountAmount,
      })
      setCouponCodeInput('')
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Unable to apply coupon.')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or create a shipping address.')
      return
    }

    if (cart.items.length === 0) {
      alert('Your cart is empty.')
      return
    }

    setSubmitting(true)
    setError(null)
    setLoadingStep('Placing order...')

    try {
      // 1. Create Pending Order with Coupon Code if applied
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: appliedCoupon?.code || undefined,
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order.')
      }

      const orderId = data.order.id

      // Order created successfully with selected payment method and paymentStatus: PENDING.
      // Payment Integration Notes:
      // - CASH_ON_DELIVERY: Legitimate offline checkout flow; payment collected upon delivery.
      // - CARD: Online gateway (Paystack) payment & webhook verification to be added next.
      // - BANK_TRANSFER: Manual merchant confirmation of bank transfer to be added next.
      // - WALLET: Digital wallet balance check and deduction service to be added next.
      // None of these are silently treated as paid.
      clearCart()
      router.push(`/orders/${orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to place order.')
      setSubmitting(false)
      setLoadingStep(null)
    }
  }

  return (
    <aside className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sticky top-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Order Summary
        </p>
        <p className="mt-1 text-xs text-slate-600">
          {cart.items.length} item(s) in your cart
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Item List */}
      <div className="space-y-3 max-h-52 overflow-y-auto pr-1 text-sm text-slate-700 divide-y divide-slate-200/60">
        {cart.items.map((item) => (
          <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900 line-clamp-1">{item.product.name}</p>
              {item.product.variants?.[0] && (
                <p className="text-xs text-slate-500">{item.product.variants[0].name}</p>
              )}
              <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
            </div>
            <p className="font-bold text-slate-900">
              {fmtCurrency((item.salePrice ?? item.unitPrice) * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Coupon Application Box */}
      <div className="border-t border-slate-200 pt-4 space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Promotional Coupon</label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            <div>
              <span className="font-mono font-bold">{appliedCoupon.code}</span>
              <span className="ml-1 text-emerald-600">(-{fmtCurrency(appliedCoupon.discountAmount)})</span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              placeholder="e.g. SAVE20"
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono uppercase focus:border-slate-900 focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              disabled={validatingCoupon || !couponCodeInput.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold shrink-0 text-xs px-3"
            >
              {validatingCoupon ? 'Applying...' : 'Apply'}
            </Button>
          </form>
        )}

        {couponError && (
          <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
        )}
      </div>

      {/* Totals Breakdown */}
      <div className="space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">{fmtCurrency(totals.subtotal)}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Discount ({appliedCoupon.code})</span>
            <span>-{fmtCurrency(totals.discount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Shipping Fee</span>
          {shippingInfo.type === 'FREE' ? (
            <span className="font-medium text-emerald-600">Free ({fmtCurrency(0)})</span>
          ) : shippingInfo.isNegotiable ? (
            <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-xs">
              To be confirmed
            </span>
          ) : (
            <span className="font-medium text-slate-900">{fmtCurrency(totals.shippingFee)}</span>
          )}
        </div>

        <div className="flex justify-between">
          <span>Estimated Tax</span>
          <span className="font-medium text-slate-900">{fmtCurrency(0)}</span>
        </div>

        <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
          <span>Grand Total</span>
          <span className="text-xl text-slate-900">{fmtCurrency(totals.grandTotal)}</span>
        </div>

        {shippingInfo.isNegotiable && (
          <p className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl leading-snug mt-2">
            <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
            <span><strong>Negotiable Shipping:</strong> Final shipping cost will be confirmed by store representatives prior to dispatch.</span>
          </p>
        )}
      </div>

      <Button
        className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        onClick={handlePlaceOrder}
        disabled={submitting || cart.items.length === 0 || !selectedAddressId}
      >
        {submitting ? (loadingStep || 'Processing...') : 'Place Order & Pay'}
      </Button>
    </aside>
  )
}
