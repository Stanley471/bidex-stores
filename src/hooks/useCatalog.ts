"use client";

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { catalogService } from '@/services/catalog.service';
import { buildCatalogQueryFromSearchParams, serializeCatalogQuery } from '@/lib/catalog/catalogState';
import type { CatalogQueryState, CatalogSortKey } from '@/types/catalog';
import type { Product } from '@/types/product';

export function useCatalog(products: Product[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(() => buildCatalogQueryFromSearchParams(searchParams), [searchParams]);

  const categories = useMemo(() => catalogService.getCategories(products), [products]);
  const brands = useMemo(() => catalogService.getBrands(products), [products]);

  const filtered = useMemo(() => {
    let next = [...products];

    if (query.category) {
      next = next.filter((product) => {
        const productCategorySlug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const parentCategorySlug = product.parentCategory?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return productCategorySlug === query.category || parentCategorySlug === query.category;
      });
    }

    if (query.brand) {
      next = next.filter((product) => {
        const brandSlug = product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return brandSlug === query.brand;
      });
    }

    next = catalogService.searchProducts(next, query.search);
    next = catalogService.filterProducts(next, query.filters);
    next = catalogService.sortProducts(next, query.sort);

    return catalogService.paginateProducts(next, query);
  }, [products, query]);

  const updateQuery = (updates: Partial<CatalogQueryState>) => {
    const nextQuery = { ...query, ...updates };
    const queryString = serializeCatalogQuery(nextQuery);

    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const setSort = (sort: CatalogSortKey) => updateQuery({ sort, page: 1 });
  const setPage = (page: number) => updateQuery({ page });
  const setPageSize = (pageSize: number) => updateQuery({ pageSize, page: 1 });
  const setSearch = (search: string) => updateQuery({ search, page: 1 });
  const setCategory = (category: string | null) => updateQuery({ category, page: 1 });
  const setBrand = (brand: string | null) => updateQuery({ brand, page: 1 });
  const setFilters = (filters: CatalogQueryState['filters']) => updateQuery({ filters, page: 1 });

  return {
    query,
    categories,
    brands,
    result: filtered,
    updateQuery,
    setSort,
    setPage,
    setPageSize,
    setSearch,
    setCategory,
    setBrand,
    setFilters,
  };
}
