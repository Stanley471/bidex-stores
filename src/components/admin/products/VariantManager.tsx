'use client'

import { useState } from 'react'
import type { ProductVariantInput } from '@/lib/product/validation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface VariantManagerProps {
  variants: ProductVariantInput[]
  onChange: (variants: ProductVariantInput[]) => void
  currencySymbol?: string
}

export function VariantManager({ variants, onChange, currencySymbol = '$' }: VariantManagerProps) {
  const [attrKey, setAttrKey] = useState('')
  const [attrValue, setAttrValue] = useState('')
  const [currentAttrs, setCurrentAttrs] = useState<Record<string, string>>({})
  const [sku, setSku] = useState('')
  const [priceOverride, setPriceOverride] = useState('')
  const [stock, setStock] = useState('0')

  const handleAddAttributeToDraft = () => {
    if (!attrKey.trim() || !attrValue.trim()) return
    setCurrentAttrs((prev) => ({
      ...prev,
      [attrKey.trim()]: attrValue.trim(),
    }))
    setAttrKey('')
    setAttrValue('')
  }

  const handleRemoveAttributeFromDraft = (key: string) => {
    setCurrentAttrs((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleAddVariant = () => {
    if (Object.keys(currentAttrs).length === 0) {
      alert('Please add at least one attribute (e.g. Size: M or Color: Black) for this variant.')
      return
    }

    const newVariant: ProductVariantInput = {
      sku: sku.trim() || undefined,
      priceOverride: priceOverride.trim() ? parseFloat(priceOverride) : undefined,
      stock: parseInt(stock, 10) || 0,
      attributes: currentAttrs,
      isActive: true,
    }

    onChange([...variants, newVariant])
    setCurrentAttrs({})
    setSku('')
    setPriceOverride('')
    setStock('0')
  }

  const handleRemoveVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  const handleToggleActive = (index: number) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], isActive: !updated[index].isActive }
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      {/* Add Variant Box */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
        <h4 className="text-sm font-semibold text-slate-900">Add New Variant</h4>

        {/* Key-Value Attribute Builder */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700">Variant Attributes (e.g. Size = M, Color = Black)</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={attrKey}
              onChange={(e) => setAttrKey(e.target.value)}
              placeholder="Attribute (e.g. size)"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
            />
            <input
              type="text"
              value={attrValue}
              onChange={(e) => setAttrValue(e.target.value)}
              placeholder="Value (e.g. Medium)"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddAttributeToDraft}>
              + Add Attribute
            </Button>
          </div>

          {/* Render drafted attributes */}
          {Object.keys(currentAttrs).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(currentAttrs).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white"
                >
                  {k}: <span className="font-bold">{v}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttributeFromDraft(k)}
                    aria-label={`Remove attribute ${k}`}
                    className="ml-1 text-slate-300 hover:text-white"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SKU, Price Override, Stock */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">Variant SKU (Optional)</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. TSHIRT-BLK-M"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Price Override ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
              placeholder="Leave empty for base price"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Variant Stock *</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleAddVariant}>
            Save Variant
          </Button>
        </div>
      </div>

      {/* List Existing Variants */}
      {variants.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No variants created yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 uppercase">
              <tr>
                <th className="px-4 py-3">Attributes</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price Override</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {variants.map((v, i) => (
                <tr key={i} className={!v.isActive ? 'opacity-50 bg-slate-50' : ''}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(v.attributes || {}).map(([key, val]) => (
                        <span
                          key={key}
                          className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-semibold"
                        >
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.sku || '—'}</td>
                  <td className="px-4 py-3">
                    {v.priceOverride !== undefined && v.priceOverride !== null
                      ? `$${Number(v.priceOverride).toFixed(2)}`
                      : 'Base Price'}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{v.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(i)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        v.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {v.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(i)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
