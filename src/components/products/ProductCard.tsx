'use client'

import Link from 'next/link'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import type { ProductCardProps } from '@/types/product'
import { formatCurrency } from '@/lib/currency'
import { StarRating } from '@/components/ui/StarRating'
import { useWishlist } from '@/hooks/useWishlist'
import { Heart } from 'lucide-react'

function formatPrice(amount: number, currencyCode?: string): string {
  return formatCurrency(amount, currencyCode || 'NGN')
}

export function ProductCard({
  product,
  href,
  className = '',
  showRating = true,
  showActions = true,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  const cardHref = href ?? `/products/${product.slug}`
  const firstImgSrc = product.images[0]?.src || ''
  const isUrl = firstImgSrc.startsWith('http') || firstImgSrc.startsWith('/')

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    void toggleWishlist(product)
  }

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md hover:border-slate-300 ${className}`}
    >
      {/* Thumbnail Image Container */}
      <div className="relative aspect-square w-full bg-slate-50/90 p-2 border-b border-slate-100 overflow-hidden flex items-center justify-center">
        <Link href={cardHref} className="block h-full w-full flex items-center justify-center">
          {isUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firstImgSrc}
              alt={product.name}
              className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-4xl sm:text-5xl transition-transform duration-300 group-hover:scale-110">
              {firstImgSrc || '📦'}
            </span>
          )}
        </Link>

        {/* Wishlist Heart Toggle Button (Desktop hover only, hidden on mobile) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2 left-2 z-20 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-xs transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white hover:text-rose-600 focus:outline-none"
        >
          <Heart
            className={`h-4 w-4 sm:h-4.5 sm:w-4.5 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Discount Badge Pill overlaid directly on top-right of image */}
        {product.isOnSale && (
          <span className="absolute top-2 right-2 z-10 rounded bg-brand-secondary px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-white shadow-xs pointer-events-none">
            {product.discountPercent ? `-${product.discountPercent}%` : 'SALE'}
          </span>
        )}
      </div>

      {/* Details Container */}
      <div className="flex flex-1 flex-col justify-between p-2 sm:p-3 gap-1.5">
        <div className="space-y-1">
          <Link href={cardHref} className="block">
            <h3 className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {showRating && (
            <div className="pt-0.5">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} starSizeClass="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
          )}
        </div>

        {/* Price Row */}
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
          <span className="text-sm sm:text-base font-extrabold text-brand-primary">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.compareAtPrice && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through font-normal">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>

        {/* Primary CTA Button */}
        {showActions && (
          <div className="pt-1.5 mt-auto">
            <AddToCartButton
              product={product}
              label="ADD TO CART"
              className="w-full h-8 sm:h-9 text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-brand-primary hover:bg-brand-secondary text-white border-none shadow-xs rounded-md sm:rounded-lg transition-colors cursor-pointer"
              disabled={product.inventoryStatus === 'out_of_stock'}
            />
          </div>
        )}
      </div>
    </article>
  )
}
