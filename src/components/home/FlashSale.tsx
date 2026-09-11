'use client'

import Link from 'next/link'
import { ProductGrid } from '@/components/products/ProductGrid'
import type { ProductSectionConfig } from '@/types/homepage'
import { Zap, ChevronRight } from 'lucide-react'
import { useHomepageData } from '@/hooks/useHomepageData'
import { SkeletonProductCard } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'

interface FlashSaleProps {
  config: ProductSectionConfig
  products?: Product[]
}

export function FlashSale({ config, products: initialProducts }: FlashSaleProps) {
  const limit = config.config?.displayLimit || 6
  const clientData = useHomepageData()

  const rawProducts = initialProducts ?? clientData.data?.flashSale ?? []
  const loading = initialProducts ? false : clientData.loading

  const products = rawProducts.slice(0, limit)

  return (
    <section className="py-3 px-2 sm:px-4 max-w-6xl mx-auto">
      {/* Jumia-Style Full-Width Section Header Bar */}
      <div className="bg-brand-primary text-white px-3.5 sm:px-4 py-2.5 rounded-t-lg sm:rounded-t-xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-200 fill-amber-200" aria-hidden="true" />
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-white">
            {config.title || 'Flash Sales'}
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:underline flex items-center gap-0.5 transition-transform hover:translate-x-0.5"
        >
          <span>See All</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 p-2 bg-slate-100/60 rounded-b-lg border-x border-b border-slate-200">
          {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-white border-x border-b border-slate-200 rounded-b-lg">
          No active promotional deals or flash sale items listed right now.
        </div>
      ) : (
        <ProductGrid
          products={products}
          columns={4}
          showDescription={false}
          showStock={false}
          className="py-0"
          cardClassName="h-full"
        />
      )}
    </section>
  )
}
