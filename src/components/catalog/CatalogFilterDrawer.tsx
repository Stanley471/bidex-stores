'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { CatalogSidebar } from '@/components/catalog/CatalogSidebar'
import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import type { CatalogBrand, CatalogCategory, CatalogQueryState } from '@/types/catalog'

const emptySubscribe = () => () => {}
function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

interface CatalogFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  categories: CatalogCategory[]
  brands: CatalogBrand[]
  query: CatalogQueryState
  onSelectCategory: (category: string | null) => void
  onSelectBrand: (brand: string | null) => void
  onFiltersChange: (filters: CatalogQueryState['filters']) => void
  onResetFilters: () => void
  totalCount: number
  activeFilterCount: number
}

export function CatalogFilterDrawer({
  isOpen,
  onClose,
  categories,
  brands,
  query,
  onSelectCategory,
  onSelectBrand,
  onFiltersChange,
  onResetFilters,
  totalCount,
  activeFilterCount,
}: CatalogFilterDrawerProps) {
  const mounted = useHasMounted()

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex justify-end">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Panel */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300 z-10">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-brand-primary" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900">Filter & Refine</h2>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <CatalogSidebar
            categories={categories}
            brands={brands}
            selectedCategory={query.category}
            selectedBrand={query.brand}
            onSelectCategory={onSelectCategory}
            onSelectBrand={onSelectBrand}
          />
          <CatalogFilters filters={query.filters} onChange={onFiltersChange} />
        </div>

        {/* Drawer Footer Actions */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-brand-primary hover:bg-brand-secondary px-5 py-3 text-xs font-bold text-white uppercase tracking-wider shadow-md transition-colors cursor-pointer text-center"
          >
            Show {totalCount} Products
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
