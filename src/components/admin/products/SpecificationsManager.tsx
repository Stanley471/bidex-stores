'use client'

import { Button } from '@/components/ui/button'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import type { ProductSpecificationInput } from '@/lib/product/validation'

interface SpecificationsManagerProps {
  specifications: ProductSpecificationInput[]
  onChange: (specifications: ProductSpecificationInput[]) => void
}

export function SpecificationsManager({
  specifications,
  onChange,
}: SpecificationsManagerProps) {
  const handleAddRow = () => {
    onChange([...specifications, { key: '', value: '' }])
  }

  const handleUpdateRow = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specifications]
    updated[index] = { ...updated[index], [field]: val }
    onChange(updated)
  }

  const handleRemoveRow = (index: number) => {
    const updated = specifications.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= specifications.length) return

    const updated = [...specifications]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Add custom technical specs, dimensions, materials, or attributes for this product.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add Specification
        </Button>
      </div>

      {specifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <p className="text-xs text-slate-400">
            No specifications added yet. Click &quot;Add Specification&quot; to define custom details (e.g. Weight, Material, Battery Life, RAM).
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            className="mt-3 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            Add First Specification
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto] gap-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Name / Key</span>
            <span>Value</span>
            <span className="w-24 text-right">Actions</span>
          </div>

          {specifications.map((spec, index) => (
            <div
              key={index}
              className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto] gap-2 sm:gap-3 p-2.5 rounded-xl border border-slate-200 bg-white items-center hover:border-slate-300 transition-colors"
            >
              <div className="w-full">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => handleUpdateRow(index, 'key', e.target.value)}
                  placeholder="e.g. Color, Weight, Material, RAM"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="w-full">
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleUpdateRow(index, 'value', e.target.value)}
                  placeholder="e.g. Matte Black, 1.2 kg, 16GB"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveRow(index, 'up')}
                  title="Move Up"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={index === specifications.length - 1}
                  onClick={() => handleMoveRow(index, 'down')}
                  title="Move Down"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(index)}
                  title="Remove"
                  className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
