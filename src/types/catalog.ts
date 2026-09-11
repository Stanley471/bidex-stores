import type { Product } from '@/types/product';

export type CatalogSortKey = 'newest' | 'price-asc' | 'price-desc' | 'best-selling' | 'highest-rated';

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  parentCategoryId?: string;
  icon?: string;
  description?: string;
  itemCount?: number;
}

export interface CatalogBrand {
  id: string;
  slug: string;
  name: string;
}

export interface CatalogFilters {
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  minRating: number;
}

export interface CatalogQueryState {
  category: string | null;
  brand: string | null;
  search: string;
  sort: CatalogSortKey;
  page: number;
  pageSize: number;
  filters: CatalogFilters;
}

export interface CatalogCategoryTreeNode extends CatalogCategory {
  children: CatalogCategoryTreeNode[];
}

export interface CatalogResult {
  items: Product[];
  totalCount: number;
  pageCount: number;
  page: number;
}
