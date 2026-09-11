"use client";

import type { CatalogFilters } from '@/types/catalog';

interface CatalogFiltersProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
}

export function CatalogFilters({ filters, onChange }: CatalogFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-sm font-semibold text-slate-900">Price range</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(event) => onChange({ ...filters, minPrice: event.target.value ? Number(event.target.value) : null })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(event) => onChange({ ...filters, maxPrice: event.target.value ? Number(event.target.value) : null })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(event) => onChange({ ...filters, inStockOnly: event.target.checked })}
            className="accent-brand-primary h-4 w-4 rounded"
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(event) => onChange({ ...filters, onSaleOnly: event.target.checked })}
            className="accent-brand-primary h-4 w-4 rounded"
          />
          On sale only
        </label>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900">Minimum rating</label>
        <select
          value={filters.minRating}
          onChange={(event) => onChange({ ...filters, minRating: Number(event.target.value) })}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        >
          <option value={0}>Any rating</option>
          <option value={3}>3+ stars</option>
          <option value={4}>4+ stars</option>
          <option value={4.5}>4.5+ stars</option>
        </select>
      </div>
    </div>
  );
}
