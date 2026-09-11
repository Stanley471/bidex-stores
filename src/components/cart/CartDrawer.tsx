'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { EmptyCart } from '@/components/cart/EmptyCart'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/currency'
import { X, ShoppingBag, ArrowRight, ChevronDown, ChevronUp, Trash2, Truck } from 'lucide-react'

export function CartDrawer() {
  const router = useRouter()
  const { cart, isOpen, closeCart, clearCart, itemCount, subtotal } = useCart()
  const [showSummaryDetails, setShowSummaryDetails] = useState(false)
  const [currencyCode, setCurrencyCode] = useState('NGN')

  // Fetch store public currency preference
  useEffect(() => {
    async function fetchPublicSettings() {
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
    fetchPublicSettings()
  }, [])

  // Keyboard & Body Overflow Control
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeCart, isOpen])

  if (!isOpen) return null

  const grandTotal = cart.summary?.grandTotal || subtotal || 0

  const handleCheckoutClick = () => {
    closeCart()
    router.push('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300">
      {/* Backdrop overlay click handler */}
      <div className="absolute inset-0" onClick={closeCart} aria-hidden="true" />

      {/* Main Slide-out Panel */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Your Cart</h2>
              <p className="text-xs text-slate-500 font-medium">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-900 transition"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Items Container (Occupies max space to prioritize items view) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.items.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {/* Optional Shipping Banner */}
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-3 text-xs text-emerald-900 flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  {subtotal >= 100000
                    ? '🎉 You unlocked Free Delivery on this order!'
                    : `Add ${formatCurrency(Math.max(0, 100000 - subtotal), currencyCode)} more to unlock Free Delivery.`}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} currencyCode={currencyCode} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Compact Sticky Footer - Leaves maximum space for products */}
        {cart.items.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-4 shadow-lg space-y-3">
            {/* Collapsible Order Summary Toggle */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowSummaryDetails((prev) => !prev)}
                className="flex w-full items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-900 transition py-0.5"
              >
                <span>{showSummaryDetails ? 'Hide order breakdown' : 'View order breakdown'}</span>
                {showSummaryDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* Expandable Order Breakdown */}
              <CartSummary
                currencyCode={currencyCode}
                isCollapsible
                isOpen={showSummaryDetails}
              />
            </div>

            {/* Total Row & Primary Action */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Total</span>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(grandTotal, currencyCode)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95 group"
              >
                <span>Checkout</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Secondary Action */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition font-medium"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear cart</span>
              </button>

              <button
                type="button"
                onClick={closeCart}
                className="text-xs text-slate-500 hover:text-slate-900 transition font-medium"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
