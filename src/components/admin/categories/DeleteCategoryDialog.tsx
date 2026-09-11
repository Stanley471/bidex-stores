'use client'

import type { CategoryWithDetails } from '@/services/category.service'
import { Button } from '@/components/ui/button'

interface DeleteCategoryDialogProps {
  category: CategoryWithDetails | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
  error?: string | null
}

export function DeleteCategoryDialog({
  category,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  error,
}: DeleteCategoryDialogProps) {
  if (!isOpen || !category) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Delete Category</h3>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{category.name}</span>? This action cannot be undone.
        </p>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
