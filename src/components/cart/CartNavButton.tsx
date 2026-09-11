'use client'

import { useCart } from '@/hooks/useCart'
import { ShoppingCart } from 'lucide-react'

export function CartNavButton() {
  const { itemCount, toggleCart } = useCart()

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-transparent text-slate-700 transition-all hover:bg-slate-100 hover:text-brand-primary focus:outline-none cursor-pointer"
      aria-label={`View shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden="true" />

      {/* Supertexting count badge pill when itemCount > 0 */}
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-secondary px-1 text-[11px] font-extrabold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}
