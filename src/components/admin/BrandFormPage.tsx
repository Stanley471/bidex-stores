"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandForm } from '@/components/admin/BrandForm'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { BrandFormValues } from '@/types/brand'

interface BrandFormPageProps {
  mode: 'create' | 'edit'
  brandId?: string
}

export function BrandFormPage({ mode, brandId }: BrandFormPageProps) {
  const router = useRouter()
  const [initialData, setInitialData] = useState<BrandFormValues | undefined>(undefined)
  const [loading, setLoading] = useState(mode === 'edit')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && brandId) {
      const loadBrand = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/admin/brands/${brandId}`, {
            credentials: 'same-origin',
          })

          const data = await response.json()
          if (!response.ok || !data.success) {
            throw new Error(data.message ?? 'Unable to load the brand.')
          }

          setInitialData({
            name: data.brand.name,
            slug: data.brand.slug,
            logo: data.brand.logo ?? '',
            website: data.brand.website ?? '',
            description: data.brand.description ?? '',
          })
        } catch (error) {
          setMessage(error instanceof Error ? error.message : 'Unable to load the brand.')
        } finally {
          setLoading(false)
        }
      }

      void loadBrand()
    }
  }, [brandId, mode])

  const handleSubmit = async (values: BrandFormValues) => {
    setMessage(null)
    const url = mode === 'create' ? '/api/admin/brands' : `/api/admin/brands/${brandId}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    const response = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message ?? 'Unable to save brand.')
    }

    router.push('/admin/brands')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{mode === 'create' ? 'Create brand' : 'Edit brand'}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{mode === 'create' ? 'New brand' : 'Update brand details'}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {mode === 'create'
              ? 'Add a brand to your catalog. You can optionally provide a custom slug, logo URL, and website.'
              : 'Update the existing brand details and save the changes to keep your catalog current.'}
          </p>
        </div>

        <Button type="button" variant="outline" onClick={() => router.push('/admin/brands')}>
          Back to brands
        </Button>
      </div>

      {message ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">{message}</div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
      ) : (
        <BrandForm initialData={initialData} onSubmit={handleSubmit} submitLabel={mode === 'create' ? 'Create brand' : 'Save changes'} />
      )}
    </div>
  )
}
