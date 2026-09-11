'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Brand, Category } from '@/generated/prisma/client'
import type { ProductWithRelations } from '@/services/product.service'
import type { ProductInput } from '@/lib/product/validation'
import { ProductForm } from '@/components/admin/products/ProductForm'
import { Skeleton } from '@/components/ui/skeleton'

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, bRes, cRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch('/api/admin/brands?pageSize=100'),
          fetch('/api/admin/categories'),
        ])

        const pData = await pRes.json()
        const bData = await bRes.json()
        const cData = await cRes.json()

        if (!pRes.ok || !pData.success) {
          throw new Error(pData.message || 'Product not found.')
        }

        setProduct(pData.product)
        if (bData.success) setBrands(bData.data.brands || [])
        if (cData.success) setCategories(cData.categories || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleSubmit = async (data: ProductInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const resData = await res.json()

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update product')
      }

      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || 'Product not found.'}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Product: {product.name}</h1>
        <p className="text-sm text-slate-500">
          Update product details, pricing, inventory, images, and variants.
        </p>
      </div>

      <ProductForm
        initialData={product}
        brands={brands}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/products')}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  )
}
