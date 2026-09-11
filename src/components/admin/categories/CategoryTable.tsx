'use client'

import type { CategoryWithDetails } from '@/services/category.service'
import { Button } from '@/components/ui/button'
import { Folder } from 'lucide-react'

interface CategoryTableProps {
  categories: CategoryWithDetails[]
  onEdit: (category: CategoryWithDetails) => void
  onDelete: (category: CategoryWithDetails) => void
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No categories found. Create a category to get started.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-700">
          <tr>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Slug</th>
            <th className="px-6 py-3">Parent</th>
            <th className="px-6 py-3 text-center">Products</th>
            <th className="px-6 py-3 text-center">Subcategories</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                {category.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                    <Folder className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-slate-400 line-clamp-1">{category.description}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-xs text-slate-500">{category.slug}</td>
              <td className="px-6 py-4">
                {category.parent ? (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {category.parent.name}
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">Top Level</span>
                )}
              </td>
              <td className="px-6 py-4 text-center font-medium text-slate-900">
                {category._count?.productCategories ?? 0}
              </td>
              <td className="px-6 py-4 text-center font-medium text-slate-900">
                {category._count?.children ?? 0}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => onDelete(category)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
