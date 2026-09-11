"use client";

interface CatalogSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-900">Search</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search products by name"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
      />
    </label>
  );
}
