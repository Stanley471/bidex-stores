"use client";

import { catalogService } from '@/services/catalog.service';
import type { CatalogBrand, CatalogCategory, CatalogCategoryTreeNode } from '@/types/catalog';

interface CatalogSidebarProps {
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  selectedCategory: string | null;
  selectedBrand: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectBrand: (brand: string | null) => void;
}

function renderCategoryBranch(
  node: CatalogCategoryTreeNode,
  selectedCategory: string | null,
  onSelectCategory: (category: string | null) => void,
) {
  if (node.itemCount !== undefined && node.itemCount <= 0) {
    return null;
  }

  const isActive = selectedCategory === node.slug;
  const activeChildren = node.children.filter((child) => (child.itemCount ?? 1) > 0);

  return (
    <div key={node.id} className="space-y-2">
      <button
        type="button"
        onClick={() => onSelectCategory(node.slug)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition cursor-pointer ${
          isActive
            ? 'bg-brand-primary text-white font-semibold shadow-xs'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
        }`}
      >
        <span className="truncate">{node.name}</span>
        {node.itemCount !== undefined && node.itemCount > 0 && (
          <span
            className={`ml-2 text-xs rounded-full px-2 py-0.5 font-medium ${
              isActive ? 'bg-black/20 text-white' : 'bg-slate-200/80 text-slate-600'
            }`}
          >
            {node.itemCount}
          </span>
        )}
      </button>
      {activeChildren.length > 0 && (
        <div className="ml-3 space-y-2 border-l border-slate-200 pl-3">
          {activeChildren.map((child) => renderCategoryBranch(child, selectedCategory, onSelectCategory))}
        </div>
      )}
    </div>
  );
}

export function CatalogSidebar({
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  onSelectCategory,
  onSelectBrand,
}: CatalogSidebarProps) {
  const categoryTree = catalogService.buildCategoryTree(categories);

  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Categories</p>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm cursor-pointer transition ${selectedCategory ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/70' : 'bg-brand-primary text-white font-semibold'}`}
          >
            All categories
          </button>
          {categoryTree.map((branch) => renderCategoryBranch(branch, selectedCategory, onSelectCategory))}
        </div>
      </div>

      {brands.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Brands</p>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => onSelectBrand(null)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm cursor-pointer transition ${selectedBrand ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/70' : 'bg-brand-primary text-white font-semibold'}`}
            >
              All brands
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => onSelectBrand(brand.slug)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm cursor-pointer transition ${selectedBrand === brand.slug ? 'bg-brand-primary text-white font-semibold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'}`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
