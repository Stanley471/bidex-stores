"use client"

import { Button } from '@/components/ui/button'

interface DeleteBrandDialogProps {
  open: boolean
  brandName: string
  onConfirm: () => void
  onClose: () => void
  isDeleting?: boolean
}

export function DeleteBrandDialog({ open, brandName, onConfirm, onClose, isDeleting }: DeleteBrandDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-900">Delete brand</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{brandName}</span>? This action cannot be undone.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete brand'}
          </Button>
        </div>
      </div>
    </div>
  )
}
