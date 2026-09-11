'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Product, ProductVariant } from '@/types/product'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/StarRating'
import { formatCurrency } from '@/lib/currency'

import { useWishlist } from '@/hooks/useWishlist'
import { Heart } from 'lucide-react'

interface ProductDetailViewProps {
  product: Product
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)
  const [selectedImage, setSelectedImage] = useState(
    product.images.find((i) => i.isPrimary)?.src || product.images[0]?.src || ''
  )
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  )
  const [currencyCode, setCurrencyCode] = useState(product.currency || 'NGN')

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

  const currentPrice = selectedVariant?.price ?? product.price
  const isOutOfStock = selectedVariant
    ? selectedVariant.stockStatus === 'out_of_stock'
    : product.inventoryStatus === 'out_of_stock'

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <Link href="/products" className="text-sm font-medium text-slate-500 hover:text-slate-900">
        ← Back to catalog
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Images section */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-50 overflow-hidden border border-slate-200 p-6 flex items-center justify-center">
            {selectedImage.startsWith('http') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <span className="text-8xl">{selectedImage || '📦'}</span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img.src)}
                  className={`h-16 w-16 rounded-xl overflow-hidden border-2 bg-slate-50 p-1.5 transition cursor-pointer ${
                    selectedImage === img.src ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className="h-full w-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Section */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-primary">
            {product.category}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} starSizeClass="h-4 w-4" />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-3xl font-extrabold text-brand-primary">
              {formatCurrency(currentPrice, currencyCode)}
            </span>
            {product.compareAtPrice && !selectedVariant && (
              <span className="text-lg text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice, currencyCode)}
              </span>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-6 space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                Select Option / Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id
                  const isVarOutOfStock = v.stockStatus === 'out_of_stock'
                  const vPrice = v.price ?? product.price

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isVarOutOfStock}
                      onClick={() => setSelectedVariant(v)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition cursor-pointer ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                          : isVarOutOfStock
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-primary/50'
                      }`}
                    >
                      {v.name}
                      {vPrice !== product.price && ` (${formatCurrency(vPrice, currencyCode)})`}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock Status Badge */}
          <div className="mt-6">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                !isOutOfStock
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {!isOutOfStock ? 'In Stock & Ready to Ship' : 'Out of Stock'}
            </span>
          </div>

          {/* Add to Cart & Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <AddToCartButton
              product={product}
              variantId={selectedVariant?.id}
              disabled={isOutOfStock}
              className="h-11 px-8 bg-brand-primary hover:bg-brand-secondary text-white border-none font-bold uppercase tracking-wider shadow-md cursor-pointer transition-colors rounded-xl"
            />
            <Button
              size="lg"
              variant="outline"
              onClick={() => void toggleWishlist(product)}
              className={`flex items-center gap-2 rounded-xl transition font-semibold ${
                isWishlisted ? 'border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100' : 'hover:border-slate-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
              <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </Button>
          </div>

          {/* Specifications Box */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Product details</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <span className="font-semibold text-slate-900">Brand:</span> {product.brand}
              </li>
              {product.parentCategory && (
                <li>
                  <span className="font-semibold text-slate-900">Parent Category:</span> {product.parentCategory}
                </li>
              )}
              {selectedVariant && (
                <li>
                  <span className="font-semibold text-slate-900">Selected SKU:</span> {selectedVariant.sku || 'N/A'}
                </li>
              )}
            </ul>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Description</h2>
              <p className="text-base text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Specifications</h2>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {product.specifications.map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="w-2/5 py-2.5 px-4 font-medium text-slate-500">
                          {spec.key}
                        </td>
                        <td className="w-3/5 py-2.5 px-4 font-semibold text-slate-900">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
