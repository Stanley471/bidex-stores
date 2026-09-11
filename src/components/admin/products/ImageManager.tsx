'use client'

import { useState } from 'react'
import type { ProductImageInput } from '@/lib/product/validation'
import { Button } from '@/components/ui/button'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { Image as ImageIcon } from 'lucide-react'

interface ImageManagerProps {
  images: ProductImageInput[]
  onChange: (images: ProductImageInput[]) => void
}

export function ImageManager({ images, onChange }: ImageManagerProps) {
  const [newUrl, setNewUrl] = useState('')
  const [newAlt, setNewAlt] = useState('')
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  const handleSelectFromPicker = (media: { url: string; altText?: string }) => {
    const isFirst = images.length === 0
    const updated = [
      ...images,
      {
        url: media.url,
        altText: media.altText || undefined,
        sortOrder: images.length,
        isPrimary: isFirst,
      },
    ]
    onChange(updated)
  }

  const handleAdd = () => {
    if (!newUrl.trim()) return
    const isFirst = images.length === 0
    const updated = [
      ...images,
      {
        url: newUrl.trim(),
        altText: newAlt.trim() || undefined,
        sortOrder: images.length,
        isPrimary: isFirst,
      },
    ]
    onChange(updated)
    setNewUrl('')
    setNewAlt('')
  }

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    // If we removed the primary image, mark the first remaining image as primary
    if (images[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true
    }
    onChange(updated)
  }

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    onChange(updated)
  }

  const handleUpdateAlt = (index: number, altText: string) => {
    const updated = [...images]
    updated[index] = { ...updated[index], altText }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        title="Select Product Image from Library"
        onSelect={handleSelectFromPicker}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com/product-image.jpg"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        <input
          type="text"
          value={newAlt}
          onChange={(e) => setNewAlt(e.target.value)}
          placeholder="Alt text (description)"
          className="sm:w-1/4 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        <Button type="button" onClick={handleAdd}>
          Add URL
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowMediaPicker(true)}
          className="border-slate-300 font-bold text-slate-700 inline-flex items-center gap-1.5"
        >
          <ImageIcon className="h-4 w-4" aria-hidden="true" /> Choose Media
        </Button>
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No images added yet. Add image URLs above.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <div
              key={index}
              className={`relative rounded-xl border p-3 bg-white space-y-2 ${
                img.isPrimary ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
              }`}
            >
              <div className="aspect-video w-full rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.altText || 'Product'} className="h-full w-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Primary
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={img.altText || ''}
                  onChange={(e) => handleUpdateAlt(index, e.target.value)}
                  placeholder="Image alt text"
                  className="mt-0.5 w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                {!img.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(index)}
                    className="font-medium text-slate-600 hover:text-slate-900"
                  >
                    Set as Primary
                  </button>
                ) : (
                  <span className="text-slate-400 font-medium">Main Image</span>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
