import { Suspense } from 'react';
import { CatalogExplorer } from '@/components/catalog/CatalogExplorer';
import { storefrontService } from '@/services/storefront.service';
import { Skeleton, SkeletonProductCard } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await storefrontService.getStorefrontProducts();

  return (
    <main className="min-h-screen bg-slate-50 px-3 sm:px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-primary">Catalog</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Discover Products</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
            Explore quality tools and equipment directly from our store catalog.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonProductCard key={i} />
                ))}
              </div>
            </div>
          }
        >
          <CatalogExplorer products={products} />
        </Suspense>
      </div>
    </main>
  );
}
