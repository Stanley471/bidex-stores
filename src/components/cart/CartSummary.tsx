'use client'

import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/currency'

interface CartSummaryProps {
  currencyCode?: string
  isCollapsible?: boolean
  isOpen?: boolean
}

export function CartSummary({ currencyCode = 'NGN', isCollapsible = false, isOpen = true }: CartSummaryProps) {
  const { itemCount, subtotal, cart } = useCart()

  const summary = cart?.summary || {
    subtotal,
    itemCount,
    shipping: 0,
    tax: 0,
    couponDiscount: 0,
    grandTotal: subtotal,
  }

  const grandTotal = summary.grandTotal || subtotal

  if (isCollapsible && !isOpen) {
    return null
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-4 text-xs space-y-2.5 transition-all">
      <div className="flex items-center justify-between text-slate-600">
        <span>Items ({summary.itemCount})</span>
        <span className="font-medium text-slate-800">{formatCurrency(summary.subtotal, currencyCode)}</span>
      </div>

      {summary.couponDiscount > 0 && (
        <div className="flex items-center justify-between text-emerald-600 font-medium">
          <span>Coupon Discount</span>
          <span>-{formatCurrency(summary.couponDiscount, currencyCode)}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-slate-600">
        <span>Shipping</span>
        <span className="text-slate-500">{summary.shipping > 0 ? formatCurrency(summary.shipping, currencyCode) : 'Calculated at checkout'}</span>
      </div>

      <div className="flex items-center justify-between text-slate-600">
        <span>Estimated Tax</span>
        <span className="text-slate-500">{summary.tax > 0 ? formatCurrency(summary.tax, currencyCode) : 'Included'}</span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5 text-sm font-bold text-slate-900">
        <span>Total</span>
        <span className="text-base font-extrabold text-slate-900">{formatCurrency(grandTotal, currencyCode)}</span>
      </div>
    </div>
  )
}
