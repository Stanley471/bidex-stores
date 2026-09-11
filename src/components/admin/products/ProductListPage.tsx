'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Brand, Category } from '@/generated/prisma/client'
import type { ProductWithRelations, ProductListResult } from '@/services/product.service'
import { ProductTable } from './ProductTable'
import { DeleteProductDialog } from './DeleteProductDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductListPage() {
  const [data, setData] = useState<ProductListResult>({
    products: [],
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isPublished, setIsPublished] = useState('')
  const [isFeatured, setIsFeatured] = useState('')
  const [page, setPage] = useState(1)

  // Dropdown reference lists
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Delete state
  const [deletingProduct, setDeletingProduct] = useState<ProductWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [currencyCode, setCurrencyCode] = useState('NGN')

  // Fetch filter options (brands & categories)
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [bRes, cRes, sRes] = await Promise.all([
          fetch('/api/admin/brands?pageSize=100'),
          fetch('/api/admin/categories'),
          fetch('/api/settings/public'),
        ])
        const bData = await bRes.json()
        const cData = await cRes.json()
        const sData = await sRes.json()

        if (bData.success) setBrands(bData.data.brands || [])
        if (cData.success) setCategories(cData.categories || [])
        if (sRes.ok && sData.success && sData.settings?.currencyCode) {
          setCurrencyCode(sData.settings.currencyCode)
        }
      } catch (err) {
        console.error('Failed to load filter dropdowns', err)
      }
    }
    loadFilterOptions()
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const url = new URL('/api/admin/products', window.location.origin)
      url.searchParams.set('page', String(page))
      url.searchParams.set('pageSize', '10')

      if (search.trim()) url.searchParams.set('search', search.trim())
      if (brandId) url.searchParams.set('brandId', brandId)
      if (categoryId) url.searchParams.set('categoryId', categoryId)
      if (isPublished) url.searchParams.set('isPublished', isPublished)
      if (isFeatured) url.searchParams.set('isFeatured', isFeatured)

      const res = await fetch(url.toString())
      const resData = await res.json()

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to fetch products')
      }

      setData(resData.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching products.')
    } finally {
      setLoading(false)
    }
  }, [page, search, brandId, categoryId, isPublished, isFeatured])

  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const url = new URL('/api/admin/products', window.location.origin)
        url.searchParams.set('page', String(page))
        url.searchParams.set('pageSize', '10')

        if (search.trim()) url.searchParams.set('search', search.trim())
        if (brandId) url.searchParams.set('brandId', brandId)
        if (categoryId) url.searchParams.set('categoryId', categoryId)
        if (isPublished) url.searchParams.set('isPublished', isPublished)
        if (isFeatured) url.searchParams.set('isFeatured', isFeatured)

        const res = await fetch(url.toString())
        const resData = await res.json()

        if (!ignore) {
          if (res.ok && resData.success) {
            setData(resData.data)
          } else {
            setError(resData.message || 'Failed to fetch products')
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Error fetching products.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [page, search, brandId, categoryId, isPublished, isFeatured])

  const handleTogglePublish = async (product: ProductWithRelations) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      })
      const resData = await res.json()

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update status')
      }

      setSuccess(`Product status changed to ${!product.isPublished ? 'Published' : 'Draft'}.`)
      fetchProducts()
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to toggle publication status.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: 'DELETE',
      })
      const resData = await res.json()

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to delete product')
      }

      setSuccess('Product deleted successfully!')
      setDeletingProduct(null)
      fetchProducts()
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete product.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Manage your store inventory, pricing, variants, and catalog visibility.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>+ Create Product</Button>
        </Link>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search name, SKU, slug..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />

        <select
          value={brandId}
          onChange={(e) => {
            setBrandId(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={isPublished}
          onChange={(e) => {
            setIsPublished(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white"
        >
          <option value="">All Statuses</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>

        <select
          value={isFeatured}
          onChange={(e) => {
            setIsFeatured(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none bg-white"
        >
          <option value="">All Products</option>
          <option value="true">Featured Only</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-12 w-full rounded-lg" key={i} />
          ))}
        </div>
      ) : (
        <ProductTable
          products={data.products}
          onTogglePublish={handleTogglePublish}
          onDelete={(prod) => {
            setDeleteError(null)
            setDeletingProduct(prod)
          }}
          currencyCode={currencyCode}
        />
      )}

      {/* Pagination Controls */}
      {data.pageCount > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Showing Page <span className="font-semibold">{data.page}</span> of{' '}
            <span className="font-semibold">{data.pageCount}</span> ({data.total} products total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pageCount}
              onClick={() => setPage((p) => Math.min(data.pageCount, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteProductDialog
        product={deletingProduct}
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  )
}
