'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import type { CartItem as CartItemType } from '@/types/cart'
import { formatCurrency } from '@/lib/currency'
import { Minus, Package, Plus, Trash2, Tag } from 'lucide-react'

interface CartItemProps {
  item: CartItemType
  currencyCode?: string
}

export function CartItem({ item, currencyCode = 'NGN' }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const unitPrice = item.salePrice ?? item.unitPrice
  const originalPrice = item.unitPrice
  const hasDiscount = Boolean(item.salePrice && item.salePrice < originalPrice)
  const hasImage = Boolean(item.product.images?.[0]?.src)
  const imageSrc = item.product.images?.[0]?.src

  return (
    <div className="group relative flex gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-xs">
      {/* Thumbnail */}
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        {hasImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageSrc}
            alt={item.product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Package className="h-7 w-7 text-slate-300" aria-hidden="true" />
        )}
      </div>

      {/* Main Item Content */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 pr-2">
              <h4 className="font-semibold text-slate-900 text-sm leading-snug truncate">
                {item.product.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {item.product.category || 'General'}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition shrink-0"
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.product.name} from cart`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {hasDiscount && (
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <Tag className="h-3 w-3" />
              <span>Save {formatCurrency((originalPrice - unitPrice) * item.quantity, currencyCode)}</span>
            </div>
          )}
        </div>

        {/* Quantity Controls & Price */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5">
            <Button
              size="sm"
              variant="ghost"
              aria-label="Decrease quantity"
              className="h-6 w-6 rounded-md p-0 text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" aria-hidden="true" />
            </Button>
            <span className="min-w-7 text-center font-bold text-xs text-slate-900">
              {item.quantity}
            </span>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Increase quantity"
              className="h-6 w-6 rounded-md p-0 text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-extrabold text-slate-900 text-sm">
              {formatCurrency(unitPrice * item.quantity, currencyCode)}
            </p>
            {item.quantity > 1 && (
              <p className="text-[10px] text-slate-400 font-medium">
                {formatCurrency(unitPrice, currencyCode)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
