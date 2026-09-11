"use client";

import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, X, RotateCcw } from 'lucide-react';
import { CatalogFilterDrawer } from '@/components/catalog/CatalogFilterDrawer';
import { CatalogPagination } from '@/components/catalog/CatalogPagination';
import { CatalogSearch } from '@/components/catalog/CatalogSearch';
import { CatalogSort } from '@/components/catalog/CatalogSort';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useCatalog } from '@/hooks/useCatalog';
import type { Product } from '@/types/product';

interface CatalogExplorerProps {
  products: Product[];
}

export function CatalogExplorer({ products }: CatalogExplorerProps) {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const {
    query,
    categories,
    brands,
    result,
    setCategory,
    setBrand,
    setSearch,
    setSort,
    setFilters,
    setPage,
    setPageSize,
  } = useCatalog(products);

  // Compute Active Filter Count & Badges
  const activeCategoryName = categories.find((c) => c.slug === query.category)?.name;
  const activeBrandName = brands.find((b) => b.slug === query.brand)?.name;

  let activeFilterCount = 0;
  if (query.category) activeFilterCount++;
  if (query.brand) activeFilterCount++;
  if (query.filters.minPrice !== null) activeFilterCount++;
  if (query.filters.maxPrice !== null) activeFilterCount++;
  if (query.filters.inStockOnly) activeFilterCount++;
  if (query.filters.onSaleOnly) activeFilterCount++;
  if (query.filters.minRating > 0) activeFilterCount++;

  const handleResetFilters = () => {
    setCategory(null);
    setBrand(null);
    setSearch('');
    setFilters({
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      onSaleOnly: false,
      minRating: 0,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Compact Packed Dropdown Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all">
        {/* Compact Single-Row Toggle Header Bar */}
        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white">
          <button
            type="button"
            onClick={() => setIsControlsOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 transition cursor-pointer hover:text-brand-primary"
          >
            <Search className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
            <span>{isControlsOpen ? 'Hide Search & Filters' : 'Search & Filter Catalog'}</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-brand-primary px-2 py-0.5 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
            {isControlsOpen ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
            <span className="hidden sm:inline">Showing</span>
            <span className="font-bold text-slate-900">{result.totalCount} Products</span>
          </div>
        </div>

        {/* Collapsible Dropdown Panel for Search, Filters, Sort & Page Size */}
        {isControlsOpen && (
          <div className="border-t border-slate-100 bg-slate-50/60 p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end">
              <CatalogSearch value={query.search} onChange={setSearch} />

              {/* Filter & Refine Drawer Button */}
              <div className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Category & Brand Filters</span>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition cursor-pointer hover:border-brand-primary hover:text-brand-primary shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
                    <span>Filter & Refine</span>
                  </div>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              <CatalogSort value={query.sort} onChange={setSort} />

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">Page size</span>
                <select
                  value={query.pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 shadow-xs"
                >
                  <option value={8}>8 per page</option>
                  <option value={16}>16 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Chips / Removable Tags Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Active Filters:</span>

          {query.category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
              Category: {activeCategoryName || query.category}
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="hover:text-rose-600 transition"
                aria-label="Remove category filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {query.brand && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
              Brand: {activeBrandName || query.brand}
              <button
                type="button"
                onClick={() => setBrand(null)}
                className="hover:text-rose-600 transition"
                aria-label="Remove brand filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {query.filters.minPrice !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
              Min: ${query.filters.minPrice}
              <button
                type="button"
                onClick={() => setFilters({ ...query.filters, minPrice: null })}
                className="hover:text-rose-600 transition"
                aria-label="Remove min price filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {query.filters.maxPrice !== null && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
              Max: ${query.filters.maxPrice}
              <button
                type="button"
                onClick={() => setFilters({ ...query.filters, maxPrice: null })}
                className="hover:text-rose-600 transition"
                aria-label="Remove max price filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {query.filters.inStockOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
              In Stock Only
              <button
                type="button"
                onClick={() => setFilters({ ...query.filters, inStockOnly: false })}
                className="hover:text-rose-600 transition"
                aria-label="Remove in stock filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {query.filters.onSaleOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
              On Sale Only
              <button
                type="button"
                onClick={() => setFilters({ ...query.filters, onSaleOnly: false })}
                className="hover:text-rose-600 transition"
                aria-label="Remove on sale filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {query.filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
              {query.filters.minRating}+ Stars
              <button
                type="button"
                onClick={() => setFilters({ ...query.filters, minRating: 0 })}
                className="hover:text-rose-600 transition"
                aria-label="Remove rating filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="ml-auto flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Full-Width Responsive Product Grid */}
      <ProductGrid
        products={result.items}
        title="Product discovery"
        subtitle="Browse quality tools and equipment from our catalog."
        columns={4}
        emptyMessage="No products match the current filter selection. Try clearing a filter or searching for a different item."
      />

      {/* Catalog Pagination */}
      <CatalogPagination
        page={result.page}
        pageCount={result.pageCount}
        onPageChange={setPage}
      />

      {/* Slide-out Filter Drawer Modal */}
      <CatalogFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={categories}
        brands={brands}
        query={query}
        onSelectCategory={setCategory}
        onSelectBrand={setBrand}
        onFiltersChange={setFilters}
        onResetFilters={handleResetFilters}
        totalCount={result.totalCount}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
