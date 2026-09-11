"use client"

import { Button } from '@/components/ui/button'
import type { BrandListItem } from '@/types/brand'
import { Pencil, Trash2, ExternalLink, Tag } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface BrandTableProps {
  brands: BrandListItem[]
  onEdit: (id: string) => void
  onDelete: (brand: BrandListItem) => void
  loading?: boolean
}

export function BrandTable({ brands, onEdit, onDelete, loading }: BrandTableProps) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm sm:p-12">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Tag className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-base font-semibold text-slate-900 sm:text-lg">No brands found</p>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Use the create button to add your first brand to the catalog.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Horizontal Scrollable Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Brand Info</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Slug</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center">Products</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Website</th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-9 w-9 rounded-xl border border-slate-200 object-contain p-1 bg-white"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 text-sm">
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900">{brand.name}</div>
                      {brand.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 max-w-xs">{brand.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 align-middle text-xs font-mono font-medium text-slate-600">{brand.slug}</td>
                <td className="px-5 py-4 align-middle text-center">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {brand._count.products} item(s)
                  </span>
                </td>
                <td className="px-5 py-4 align-middle text-xs">
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      <span>Visit</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-5 py-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(brand.id)}
                      className="h-8 px-3 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-100 text-slate-700"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(brand)}
                      className="h-8 px-3 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-none"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
