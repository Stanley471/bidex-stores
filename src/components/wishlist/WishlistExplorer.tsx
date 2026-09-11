'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import type { Product } from '@/types/product'

export function WishlistExplorer() {
  const { wishlist, wishlistIds, removeFromWishlist, clearWishlist, loading: wishlistLoading } = useWishlist()
  const { addItem, openCart } = useCart()
  const [products, setProducts] = useState<Product[]>(wishlist)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch product objects for guest wishlist IDs or DB sync
  useEffect(() => {
    let ignore = false

    async function loadWishlistProducts() {
      setLoading(true)

      if (wishlist.length > 0) {
        if (!ignore) {
          setProducts(wishlist)
          setLoading(false)
        }
        return
      }

      if (wishlistIds.length === 0) {
        if (!ignore) {
          setProducts([])
          setLoading(false)
        }
        return
      }

      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (!ignore && res.ok && data.success && Array.isArray(data.data?.products)) {
          const allProducts: Product[] = data.data.products
          const matched = allProducts.filter((p) => wishlistIds.includes(p.id))
          setProducts(matched)
        }
      } catch {
        // Fallback
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadWishlistProducts()

    return () => {
      ignore = true
    }
  }, [wishlist, wishlistIds])

  const handleMoveToCart = async (product: Product) => {
    await addItem(product, 1)
    await removeFromWishlist(product.id)
    openCart()
  }

  if (wishlistLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (wishlistIds.length === 0 || products.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner">
          <Heart className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Your wishlist is empty</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Save your favorite items here to purchase later or track their price updates.
          </p>
        </div>
        <Link href="/products" className="inline-block pt-2">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-md gap-2">
            <span>Explore Products</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Saved Wishlist</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {products.length} {products.length === 1 ? 'item' : 'items'} saved in your wishlist
          </p>
        </div>

        <button
          type="button"
          onClick={clearWishlist}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition font-medium"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear wishlist</span>
        </button>
      </div>

      {/* Wishlist Product Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs hover:shadow-md transition duration-200">
            <ProductCard product={product} />

            <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
              <Button
                size="sm"
                onClick={() => handleMoveToCart(product)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Move to Cart</span>
              </Button>

              <button
                type="button"
                onClick={() => void removeFromWishlist(product.id)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition shrink-0"
                title="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
