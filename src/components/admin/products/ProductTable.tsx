'use client'

import Link from 'next/link'
import type { ProductWithRelations } from '@/services/product.service'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { formatCurrency } from '@/lib/currency'

interface ProductTableProps {
  products: ProductWithRelations[]
  onTogglePublish: (product: ProductWithRelations) => void
  onDelete: (product: ProductWithRelations) => void
  currencyCode?: string
}

export function ProductTable({ products, onTogglePublish, onDelete, currencyCode = 'NGN' }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No products found. Create a new product to populate your catalog.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-700">
          <tr>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">SKU</th>
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3 text-center">Stock</th>
            <th className="px-6 py-3">Brand & Categories</th>
            <th className="px-6 py-3 text-center">Published</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {products.map((product) => {
            const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0]
            const totalStock = product.hasVariants
              ? product.variants.reduce((acc, v) => acc + v.stock, 0)
              : product.stock

            return (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                  {primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImage.url}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                      <Package className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{product.name}</div>
                    <div className="mt-0.5">
                      <StarRating reviewCount={product._count?.reviews || 0} rating={5} starSizeClass="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {product.isFeatured && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                          Featured
                        </span>
                      )}
                      {product.isOnSale && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
                          On Sale
                        </span>
                      )}
                      {product.hasVariants && (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                          {product.variants.length} Variants
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{product.sku || '—'}</td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {formatCurrency(Number(product.basePrice), currencyCode)}
                </td>
                <td className="px-6 py-4 text-center font-medium">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      totalStock > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-semibold text-slate-900">{product.brand.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {product.categories.map((c) => c.category.name).join(', ') || 'No category'}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => onTogglePublish(product)}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${
                      product.isPublished
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {product.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => onDelete(product)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
