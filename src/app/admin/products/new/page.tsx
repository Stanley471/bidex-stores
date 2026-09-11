'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Brand, Category } from '@/generated/prisma/client'
import type { ProductInput } from '@/lib/product/validation'
import { ProductForm } from '@/components/admin/products/ProductForm'
import { Skeleton } from '@/components/ui/skeleton'

export default function NewProductPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch('/api/admin/brands?pageSize=100'),
          fetch('/api/admin/categories'),
        ])
        const bData = await bRes.json()
        const cData = await cRes.json()

        if (bData.success) setBrands(bData.data.brands || [])
        if (cData.success) setCategories(cData.categories || [])
      } catch (err) {
        setError('Failed to load initial brand and category options.')
      } finally {
        setLoading(false)
      }
    }
    loadOptions()
  }, [])

  const handleSubmit = async (data: ProductInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const resData = await res.json()

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to create product')
      }

      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create product.')
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Product</h1>
        <p className="text-sm text-slate-500">
          Add a new product to your catalog with pricing, images, organization, and variants.
        </p>
      </div>

      <ProductForm
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
