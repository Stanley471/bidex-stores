'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { calculateOrderTotals } from '@/services/checkout.service'
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency'
import { getWhatsAppCheckoutUrl } from '@/lib/whatsapp/checkout'

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
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          subtotal: cart.summary.subtotal,
        }),
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

  const handlePlaceOrder = () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty.')
      return
    }

    setSubmitting(true)
    setError(null)
    setLoadingStep('Redirecting to WhatsApp...')

    try {
      // Build WhatsApp redirect URL with formatted cart items and grand total
      const whatsappUrl = getWhatsAppCheckoutUrl({
        items: cart.items,
        total: totals.grandTotal,
        notes: notes || undefined,
      })

      // NOTE:
      // 1. Stock is NOT decremented automatically.
      // 2. No database Order record is created.
      // 3. Cart is kept intact (clearCart() is not called unless confirmed).
      window.location.href = whatsappUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to redirect to WhatsApp.')
      setSubmitting(false)
      setLoadingStep(null)
    }
  }

  /*
   * PREVIOUS DB ORDER PLACEMENT & PAYMENT GATEWAY FLOW
   * Retained for future reference:
   *
   * const handlePlaceOrderViaDb = async () => {
   *   if (!selectedAddressId) {
   *     alert('Please select or create a shipping address.')
   *     return
   *   }
   *   if (cart.items.length === 0) {
   *     alert('Your cart is empty.')
   *     return
   *   }
   *   setSubmitting(true)
   *   setError(null)
   *   setLoadingStep('Placing order...')
   *   try {
   *     const res = await fetch('/api/orders', {
   *       method: 'POST',
   *       headers: { 'Content-Type': 'application/json' },
   *       body: JSON.stringify({
   *         addressId: selectedAddressId,
   *         paymentMethod,
   *         couponCode: appliedCoupon?.code || undefined,
   *         notes,
   *       }),
   *     })
   *     const data = await res.json()
   *     if (!res.ok || !data.success) {
   *       throw new Error(data.message || 'Failed to place order.')
   *     }
   *     const orderId = data.order.id
   *     clearCart()
   *     router.push(`/orders/${orderId}`)
   *   } catch (err) {
   *     setError(err instanceof Error ? err.message : 'Unable to place order.')
   *     setSubmitting(false)
   *     setLoadingStep(null)
   *   }
   * }
   */

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
        className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors"
        onClick={handlePlaceOrder}
        disabled={submitting || cart.items.length === 0}
      >
        <svg
          viewBox="0 0 448 512"
          width={20}
          height={20}
          fill="currentColor"
          className="shrink-0"
          aria-hidden="true"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
        <span>{submitting ? (loadingStep || 'Redirecting...') : 'Order on WhatsApp'}</span>
      </Button>
    </aside>
  )
}
