'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Grid,
  Layers,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  Camera,
  Tv,
  Gamepad2,
  Wrench,
  Cable,
  Cpu,
  type LucideIcon,
} from 'lucide-react'
import type { CategoriesSectionConfig } from '@/types/homepage'
import { useHomepageData, type HomepageCategoryItem } from '@/hooks/useHomepageData'
import { SkeletonCategoryCard } from '@/components/ui/skeleton'

export interface CategoryItem extends HomepageCategoryItem {
  image?: string | null
}

interface CategoriesProps {
  config: CategoriesSectionConfig
  categories?: CategoryItem[]
}

function getCategoryIcon(slug: string = '', name: string = ''): LucideIcon {
  const normalized = `${slug} ${name}`.toLowerCase()
  if (
    normalized.includes('phone') ||
    normalized.includes('iphone') ||
    normalized.includes('android') ||
    normalized.includes('mobile')
  ) {
    return Smartphone
  }
  if (
    normalized.includes('laptop') ||
    normalized.includes('computer') ||
    normalized.includes('pc') ||
    normalized.includes('mac')
  ) {
    return Laptop
  }
  if (normalized.includes('tablet') || normalized.includes('ipad')) {
    return Tablet
  }
  if (
    normalized.includes('audio') ||
    normalized.includes('headphone') ||
    normalized.includes('earbud') ||
    normalized.includes('speaker') ||
    normalized.includes('sound')
  ) {
    return Headphones
  }
  if (normalized.includes('watch') || normalized.includes('wearable')) {
    return Watch
  }
  if (normalized.includes('camera') || normalized.includes('photo')) {
    return Camera
  }
  if (
    normalized.includes('game') ||
    normalized.includes('gaming') ||
    normalized.includes('console')
  ) {
    return Gamepad2
  }
  if (
    normalized.includes('tv') ||
    normalized.includes('television') ||
    normalized.includes('monitor') ||
    normalized.includes('display')
  ) {
    return Tv
  }
  if (
    normalized.includes('tool') ||
    normalized.includes('hardware') ||
    normalized.includes('wrench') ||
    normalized.includes('drill')
  ) {
    return Wrench
  }
  if (
    normalized.includes('accessori') ||
    normalized.includes('cable') ||
    normalized.includes('charger')
  ) {
    return Cable
  }
  if (
    normalized.includes('component') ||
    normalized.includes('chip') ||
    normalized.includes('cpu')
  ) {
    return Cpu
  }
  return Layers
}

function CategoryCardItem({ category }: { category: CategoryItem }) {
  const [imgError, setImgError] = useState(false)
  const IconComponent = getCategoryIcon(category.slug, category.name)
  const hasValidImg = Boolean(
    category.image &&
      (category.image.startsWith('http') || category.image.startsWith('/')) &&
      !imgError,
  )

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex flex-col items-center text-center rounded-xl sm:rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-slate-50/20 p-3 sm:p-4 hover:bg-white hover:border-brand-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Category Icon Container */}
      <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center p-2.5 mb-2.5 group-hover:border-brand-primary/40 group-hover:shadow-xs group-hover:bg-brand-primary/5 transition-all duration-200">
        {hasValidImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image!}
            alt={category.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <IconComponent
            className="h-7 w-7 sm:h-8 sm:w-8 text-brand-primary transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Category Details */}
      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 w-full">
        {category.name}
      </h3>

      {typeof category.productCount === 'number' && (
        <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5">
          {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
        </span>
      )}
    </Link>
  )
}

export function Categories({ config, categories: initialCategories }: CategoriesProps) {
  const limit = config.config?.displayLimit || 8
  const clientData = useHomepageData()

  const rawCategories = initialCategories ?? clientData.data?.categories ?? []
  const loading = initialCategories ? false : clientData.loading

  const activeCategories = rawCategories
    .filter((cat) => (cat.productCount ?? 0) > 0)
    .slice(0, limit)

  return (
    <section className="py-3 px-2 sm:px-4 max-w-6xl mx-auto">
      {/* Section Header Bar */}
      <div className="bg-brand-primary text-white px-3.5 sm:px-4 py-2.5 rounded-t-lg sm:rounded-t-xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Grid className="h-5 w-5 text-amber-200" aria-hidden="true" />
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-white">
            {config.title || 'Shop by Category'}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3.5 sm:p-5 bg-white border-x border-b border-slate-200 rounded-b-lg">
          {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <SkeletonCategoryCard key={i} />
          ))}
        </div>
      ) : activeCategories.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-white border-x border-b border-slate-200 rounded-b-lg">
          No featured categories with items available right now.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3.5 sm:p-5 bg-white border-x border-b border-slate-200 rounded-b-lg shadow-xs">
          {activeCategories.map((category) => (
            <CategoryCardItem key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  )
}
