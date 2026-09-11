import { ProductCard } from '@/components/products/ProductCard'
import type { ProductGridProps } from '@/types/product'

const columnClasses: Record<NonNullable<ProductGridProps['columns']>, string> = {
  2: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  3: 'grid-cols-2 min-[360px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  4: 'grid-cols-2 min-[360px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
}

export function ProductGrid({
  products,
  title,
  subtitle,
  columns = 4,
  limit,
  emptyMessage = 'No products available right now.',
  className = '',
  cardClassName = '',
  showDescription = true,
  showRating = true,
  showStock = true,
  showActions = true,
}: ProductGridProps) {
  const visibleProducts = limit ? products.slice(0, limit) : products

  if (!visibleProducts.length) {
    return (
      <section className={`py-4 ${className}`}>
        <div className="mx-auto flex max-w-6xl flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-8 text-center">
          <h3 className="text-sm font-semibold text-slate-800">{title ?? 'Products'}</h3>
          <p className="mt-1 text-xs text-slate-500">{emptyMessage}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={`w-full ${className}`}>
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          </div>
        )}

        {/* 3-Column Mobile Grid with tight gap and minimal whitespace */}
        <div className={`grid gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 bg-slate-100/60 rounded-b-lg sm:rounded-b-xl border-x border-b border-slate-200 ${columnClasses[columns]}`}>
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className={cardClassName}
              showDescription={showDescription}
              showRating={showRating}
              showStock={showStock}
              showActions={showActions}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
