'use client'

import { useState } from 'react'
import type { CategoryWithDetails } from '@/services/category.service'
import { Button } from '@/components/ui/button'

interface CategoryFormProps {
  initialData?: CategoryWithDetails
  categories: CategoryWithDetails[]
  onSubmit: (data: {
    name: string
    slug?: string
    description?: string
    image?: string
    parentId?: string | null
  }) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  error?: string | null
}

export function CategoryForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [image, setImage] = useState(initialData?.image ?? '')
  const [parentId, setParentId] = useState<string>(initialData?.parentId ?? '')

  // Filter out self and descendants if editing to prevent circular selection in UI
  const availableParents = categories.filter((cat) => {
    if (!initialData) return true
    if (cat.id === initialData.id) return false
    if (cat.parentId === initialData.id) return false
    return true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      parentId: parentId || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Category Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Power Tools"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Slug (Optional)</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. power-tools (auto-generated if empty)"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Parent Category</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
        >
          <option value="">None (Top-level Category)</option>
          {availableParents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.parent ? `${cat.parent.name} → ${cat.name}` : cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Image URL (Optional)</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/category-image.jpg"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Description (Optional)</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of products in this category..."
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}
