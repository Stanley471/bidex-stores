'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CategoryWithDetails } from '@/services/category.service'
import { CategoryForm } from './CategoryForm'
import { CategoryTable } from './CategoryTable'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function CategoryListPage() {
  const [categories, setCategories] = useState<CategoryWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithDetails | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      const url = new URL('/api/admin/categories', window.location.origin)
      if (search.trim()) url.searchParams.set('search', search.trim())

      const res = await fetch(url.toString())
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load categories')
      }

      setCategories(data.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching categories.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const url = new URL('/api/admin/categories', window.location.origin)
        if (search.trim()) url.searchParams.set('search', search.trim())

        const res = await fetch(url.toString())
        const data = await res.json()

        if (!ignore) {
          if (res.ok && data.success) {
            setCategories(data.categories)
          } else {
            setError(data.message || 'Failed to load categories')
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Error fetching categories.')
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
  }, [search])

  const handleCreateOpen = () => {
    setEditingCategory(null)
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleEditOpen = (category: CategoryWithDetails) => {
    setEditingCategory(category)
    setFormError(null)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (formData: {
    name: string
    slug?: string
    description?: string
    image?: string
    parentId?: string | null
  }) => {
    setFormSubmitting(true)
    setFormError(null)

    try {
      const isEdit = !!editingCategory
      const endpoint = isEdit
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save category')
      }

      setSuccess(isEdit ? 'Category updated successfully!' : 'Category created successfully!')
      setIsFormOpen(false)
      fetchCategories()
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save category.')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete category')
      }

      setSuccess('Category deleted successfully!')
      setDeletingCategory(null)
      fetchCategories()
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete category.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">
            Manage product categories and parent/child hierarchies.
          </p>
        </div>
        <Button onClick={handleCreateOpen}>+ Create Category</Button>
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

      <div className="flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories by name or slug..."
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className="h-12 w-full rounded-lg" key={i} />
          ))}
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={handleEditOpen}
          onDelete={(cat) => {
            setDeleteError(null)
            setDeletingCategory(cat)
          }}
        />
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>
            <CategoryForm
              initialData={editingCategory ?? undefined}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={formSubmitting}
              error={formError}
            />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteCategoryDialog
        category={deletingCategory}
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  )
}
