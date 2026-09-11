import type { CatalogQueryState, CatalogFilters } from '@/types/catalog';

export const DEFAULT_CATALOG_QUERY: CatalogQueryState = {
  category: null,
  brand: null,
  search: '',
  sort: 'newest',
  page: 1,
  pageSize: 8,
  filters: {
    minPrice: null,
    maxPrice: null,
    inStockOnly: false,
    onSaleOnly: false,
    minRating: 0,
  },
};

export const DEFAULT_FILTERS: CatalogFilters = DEFAULT_CATALOG_QUERY.filters;

export function buildCatalogQueryFromSearchParams(searchParams: URLSearchParams): CatalogQueryState {
  const query: CatalogQueryState = {
    ...DEFAULT_CATALOG_QUERY,
    category: searchParams.get('category') ?? null,
    brand: searchParams.get('brand') ?? null,
    search: searchParams.get('search') ?? '',
    sort: (searchParams.get('sort') as CatalogQueryState['sort']) ?? 'newest',
    page: Number(searchParams.get('page') ?? '1'),
    pageSize: Number(searchParams.get('pageSize') ?? '8'),
    filters: {
      ...DEFAULT_FILTERS,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
      inStockOnly: searchParams.get('inStockOnly') === 'true',
      onSaleOnly: searchParams.get('sale') === 'true',
      minRating: Number(searchParams.get('minRating') ?? '0'),
    },
  };

  if (!Number.isFinite(query.page) || query.page < 1) query.page = 1;
  if (!Number.isFinite(query.pageSize) || query.pageSize < 1) query.pageSize = 8;

  return query;
}

export function serializeCatalogQuery(query: CatalogQueryState): string {
  const params = new URLSearchParams();

  if (query.category) params.set('category', query.category);
  if (query.brand) params.set('brand', query.brand);
  if (query.search) params.set('search', query.search);
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  if (query.page > 1) params.set('page', String(query.page));
  if (query.pageSize !== DEFAULT_CATALOG_QUERY.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.filters.minPrice !== null) params.set('minPrice', String(query.filters.minPrice));
  if (query.filters.maxPrice !== null) params.set('maxPrice', String(query.filters.maxPrice));
  if (query.filters.inStockOnly) params.set('inStockOnly', 'true');
  if (query.filters.onSaleOnly) params.set('sale', 'true');
  if (query.filters.minRating > 0) params.set('minRating', String(query.filters.minRating));

  return params.toString();
}
