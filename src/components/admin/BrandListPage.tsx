"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BrandTable } from '@/components/admin/BrandTable'
import { DeleteBrandDialog } from '@/components/admin/DeleteBrandDialog'
import { Button } from '@/components/ui/button'
import type { BrandListItem } from '@/types/brand'
import { Plus, Search, Tag } from 'lucide-react'

interface BrandResponse {
  success: boolean
  data: {
    brands: BrandListItem[]
    total: number
    page: number
    pageSize: number
    pageCount: number
  }
}

export function BrandListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [brands, setBrands] = useState<BrandListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'))
  const [pageCount, setPageCount] = useState(1)
  const [selectedBrand, setSelectedBrand] = useState<BrandListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    params.set('page', String(page))
    return params.toString()
  }, [page, search])

  useEffect(() => {
    let ignore = false

    async function fetchBrands() {
      setLoading(true)
      setMessage(null)

      try {
        const response = await fetch(`/api/admin/brands?${queryString}`, {
          credentials: 'same-origin',
        })

        if (!response.ok) {
          throw new Error('Unable to load brands.')
        }

        const data: BrandResponse = await response.json()

        if (!ignore && data.success) {
          setBrands(data.data.brands)
          setPage(data.data.page)
          setPageCount(data.data.pageCount)
        }
      } catch (error) {
        if (!ignore) {
          setMessage(error instanceof Error ? error.message : 'Loading failed.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void fetchBrands()
    return () => {
      ignore = true
    }
  }, [queryString])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    void router.push(`/admin/brands?search=${encodeURIComponent(search)}&page=1`)
  }

  const handleDelete = async () => {
    if (!selectedBrand) return

    setIsDeleting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/brands/${selectedBrand.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? 'Unable to delete brand.')
      }

      setSelectedBrand(null)
      setMessage('Brand deleted successfully.')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete the brand.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    void router.push(`/admin/brands?search=${encodeURIComponent(search)}&page=${newPage}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/brands/${id}`)
  }

  const handleCreate = () => {
    router.push('/admin/brands/new')
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Tag className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>Brand Management</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Manage Brands</h1>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Search, create, and manage manufacturer brands in your catalog.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-5 rounded-xl w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Create Brand
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by brand name or slug..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-5 rounded-xl flex-1 sm:flex-none"
            >
              Search
            </Button>
            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                  router.push('/admin/brands?page=1')
                }}
                className="text-xs font-semibold h-10 px-4 rounded-xl border-slate-200 text-slate-600"
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>

      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      {/* Table */}
      <BrandTable brands={brands} onEdit={handleEdit} onDelete={setSelectedBrand} loading={loading} />

      {/* Pagination Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
          Showing Page <span className="font-bold text-slate-900">{page}</span> of{' '}
          <span className="font-bold text-slate-900">{pageCount}</span>
        </p>

        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="h-9 px-4 text-xs font-semibold rounded-xl border-slate-200"
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(pageCount, page + 1))}
            disabled={page >= pageCount || loading}
            className="h-9 px-4 text-xs font-semibold rounded-xl border-slate-200"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteBrandDialog
        open={Boolean(selectedBrand)}
        brandName={selectedBrand?.name ?? ''}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setSelectedBrand(null)}
      />
    </div>
  )
}
