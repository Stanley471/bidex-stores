'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SkeletonTableRow } from '@/components/ui/skeleton'
import { CouponFormModal, type CouponItem } from './CouponFormModal'
import { formatCurrency } from '@/lib/currency'

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'No limit'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CouponListPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currencyCode, setCurrencyCode] = useState('NGN')

  useEffect(() => {
    async function loadCurrency() {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        if (res.ok && data.success && data.settings?.currencyCode) {
          setCurrencyCode(data.settings.currencyCode)
        }
      } catch {
        // Fallback default retained
      }
    }
    void loadCurrency()
  }, [])

  // Pagination
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null)

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '10',
      })
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/coupons?${params.toString()}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load coupons.')
      }

      setCoupons(data.data.coupons)
      setPageCount(data.data.pageCount)
      setTotal(data.data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load coupons.')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    let ignore = false
    async function fetchList() {
      if (!ignore) {
        await loadCoupons()
      }
    }
    fetchList()
    return () => {
      ignore = true
    }
  }, [loadCoupons])

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete coupon.')
      }

      loadCoupons()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to delete coupon.')
    }
  }

  const handleToggleActive = async (coupon: CouponItem) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update coupon status.')
      }

      loadCoupons()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to update status.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions & Coupons</h1>
          <p className="text-sm text-slate-500">
            Create and manage promotional discount codes for store customer checkout ({total} total).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCoupon(null)
            setIsModalOpen(true)
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
        >
          + Create Coupon
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by code or description..."
          className="w-full sm:w-80 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Type & Value</th>
                <th className="px-6 py-4">Min Order</th>
                <th className="px-6 py-4">Max Discount</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <>
                  <SkeletonTableRow columns={7} />
                  <SkeletonTableRow columns={7} />
                  <SkeletonTableRow columns={7} />
                </>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No coupons found. Click &quot;+ Create Coupon&quot; to add one.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-900 border border-slate-200">
                        {coupon.code}
                      </span>
                      {coupon.description && (
                        <p className="font-sans text-xs text-slate-400 font-normal mt-1 max-w-xs line-clamp-1">
                          {coupon.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% OFF`
                        : `${formatCurrency(Number(coupon.discountValue), currencyCode)} OFF`}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {coupon.minimumOrderAmount && Number(coupon.minimumOrderAmount) > 0
                        ? formatCurrency(Number(coupon.minimumOrderAmount), currencyCode)
                        : 'None'}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {coupon.maximumDiscount && Number(coupon.maximumDiscount) > 0
                        ? formatCurrency(Number(coupon.maximumDiscount), currencyCode)
                        : 'No cap'}
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {coupon.usedCount ?? 0} / {coupon.usageLimit ?? '∞'}
                      <p className="text-[11px] text-slate-400 font-normal">
                        Limit {coupon.perUserLimit ?? 1}/user
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition ${
                          coupon.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Exp: {formatDate(coupon.expiresAt)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCoupon(coupon)
                          setIsModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:border-red-200"
                        onClick={() => handleDelete(coupon.id!, coupon.code)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <span className="text-xs text-slate-500">
              Page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <CouponFormModal
        isOpen={isModalOpen}
        initialData={editingCoupon}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadCoupons()}
      />
    </div>
  )
}
