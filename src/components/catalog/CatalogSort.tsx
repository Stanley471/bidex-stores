"use client";

import type { CatalogSortKey } from '@/types/catalog';

interface CatalogSortProps {
  value: CatalogSortKey;
  onChange: (value: CatalogSortKey) => void;
}

const sortOptions: { value: CatalogSortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price Low → High' },
  { value: 'price-desc', label: 'Price High → Low' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'highest-rated', label: 'Highest Rated' },
];

export function CatalogSort({ value, onChange }: CatalogSortProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-900">Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as CatalogSortKey)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
