import type { CatalogBrand, CatalogCategory, CatalogCategoryTreeNode, CatalogFilters, CatalogQueryState, CatalogResult, CatalogSortKey } from '@/types/catalog';
import type { Product } from '@/types/product';

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function toDateValue(value?: string): number {
  const parsed = value ? Date.parse(value) : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const catalogService = {
  getCategories(products: Product[]): CatalogCategory[] {
    const categoryMap = new Map<string, CatalogCategory & { itemCount: number }>();

    products.forEach((product) => {
      if (!product.category) return;

      const catSlug = slugify(product.category);
      const existing = categoryMap.get(catSlug);

      if (existing) {
        existing.itemCount += 1;
      } else {
        categoryMap.set(catSlug, {
          id: product.category,
          slug: catSlug,
          name: product.category,
          parentCategoryId: product.parentCategory ? slugify(product.parentCategory) : undefined,
          itemCount: 1,
        });
      }

      if (product.parentCategory) {
        const parentSlug = slugify(product.parentCategory);
        const parentExisting = categoryMap.get(parentSlug);

        if (parentExisting) {
          parentExisting.itemCount += 1;
        } else {
          categoryMap.set(parentSlug, {
            id: product.parentCategory,
            slug: parentSlug,
            name: product.parentCategory,
            itemCount: 1,
          });
        }
      }
    });

    return Array.from(categoryMap.values()).filter((c) => c.itemCount > 0);
  },

  getBrands(products: Product[]): CatalogBrand[] {
    const brands = Array.from(
      new Map(
        products.map((product) => {
          const brand = product.brand;
          return [brand, {
            id: brand,
            slug: slugify(brand),
            name: brand,
          }];
        })
      ).values()
    );

    return brands;
  },

  searchProducts(products: Product[], search: string): Product[] {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((product) => product.name.toLowerCase().includes(normalized));
  },

  filterProducts(products: Product[], filters: CatalogFilters): Product[] {
    return products.filter((product) => {
      if (filters.minPrice !== null && product.price < filters.minPrice) return false;
      if (filters.maxPrice !== null && product.price > filters.maxPrice) return false;
      if (filters.inStockOnly && product.inventoryStatus === 'out_of_stock') return false;
      if (filters.onSaleOnly && !product.isOnSale) return false;
      if (filters.minRating > 0 && product.rating < filters.minRating) return false;
      return true;
    });
  },

  sortProducts(products: Product[], sort: CatalogSortKey): Product[] {
    const sorted = [...products];

    switch (sort) {
      case 'newest':
        return sorted.sort((a, b) => toDateValue(b.createdAt) - toDateValue(a.createdAt));
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'best-selling':
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'highest-rated':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  },

  paginateProducts(products: Product[], query: Pick<CatalogQueryState, 'page' | 'pageSize'>): CatalogResult {
    const page = Math.max(1, query.page);
    const pageSize = Math.max(1, query.pageSize);
    const totalCount = products.length;
    const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(page, pageCount);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: products.slice(start, end),
      totalCount,
      pageCount,
      page: safePage,
    };
  },

  buildCategoryTree(categories: CatalogCategory[]): CatalogCategoryTreeNode[] {
    const categoryMap = new Map(categories.map((category) => [category.slug, { ...category, children: [] as CatalogCategoryTreeNode[] }]));

    const rootCategories: CatalogCategoryTreeNode[] = [];

    categories.forEach((category) => {
      const node = categoryMap.get(category.slug);
      if (!node) return;

      if (category.parentCategoryId) {
        const parentNode = categoryMap.get(category.parentCategoryId);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  },
};
