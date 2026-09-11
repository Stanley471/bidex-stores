'use client'

import { useState, useEffect } from 'react'
import type { Brand, Category } from '@/generated/prisma/client'
import type { ProductWithRelations } from '@/services/product.service'
import type { ProductInput, ProductImageInput, ProductVariantInput, ProductSpecificationInput } from '@/lib/product/validation'
import { ImageManager } from './ImageManager'
import { VariantManager } from './VariantManager'
import { SpecificationsManager } from './SpecificationsManager'
import { AiProductGenerator } from './AiProductGenerator'
import { Button } from '@/components/ui/button'

interface ProductFormProps {
  initialData?: ProductWithRelations
  brands: Brand[]
  categories: Category[]
  onSubmit: (data: ProductInput) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  error?: string | null
}

export function ProductForm({
  initialData,
  brands,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: ProductFormProps) {
  const [currencySymbol, setCurrencySymbol] = useState('$')

  useEffect(() => {
    fetch('/api/settings/public')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings?.currencySymbol) {
          setCurrencySymbol(data.settings.currencySymbol)
        }
      })
      .catch(() => {})
  }, [])

  // Basic info
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [sku, setSku] = useState(initialData?.sku ?? '')

  // Pricing & Inventory
  const [basePrice, setBasePrice] = useState(initialData?.basePrice ? String(initialData.basePrice) : '0.00')
  const [stock, setStock] = useState(initialData?.stock ? String(initialData.stock) : '0')
  const [hasVariants, setHasVariants] = useState(initialData?.hasVariants ?? false)

  // Organization
  const [brandId, setBrandId] = useState(initialData?.brandId ?? (brands[0]?.id || ''))
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialData?.categories?.map((c) => c.category.id) ?? []
  )

  // Visibility
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [isOnSale, setIsOnSale] = useState(initialData?.isOnSale ?? false)

  // Images
  const [images, setImages] = useState<ProductImageInput[]>(
    initialData?.images?.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
    })) ?? []
  )

  // Variants
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    initialData?.variants?.map((v) => ({
      id: v.id,
      sku: v.sku,
      priceOverride: v.priceOverride ? Number(v.priceOverride) : undefined,
      stock: v.stock,
      attributes: (v.attributes as Record<string, string>) || {},
      isActive: v.isActive,
    })) ?? []
  )

  // Specifications
  const [specifications, setSpecifications] = useState<ProductSpecificationInput[]>(() => {
    if (initialData && 'specifications' in initialData && Array.isArray((initialData as { specifications?: unknown }).specifications)) {
      return ((initialData as { specifications?: unknown }).specifications as Array<{ key?: string; value?: string }>).map((s) => ({
        key: s.key || '',
        value: s.value || '',
      }))
    }
    return []
  })

  const handleCategoryToggle = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    )
  }

  const handleAiGenerated = (data: {
    name?: string
    description: string
    specifications: ProductSpecificationInput[]
  }) => {
    if (data.name) {
      setName(data.name)
    }

    if (data.description) {
      setDescription(data.description)
    }

    if (data.specifications && data.specifications.length > 0) {
      setSpecifications((prev) => {
        const validPrev = prev.filter((s) => s.key.trim() || s.value.trim())
        const existingKeys = new Set(validPrev.map((s) => s.key.trim().toLowerCase()))
        const newSpecs = data.specifications.filter(
          (s) => !existingKeys.has(s.key.trim().toLowerCase()),
        )
        return [...validPrev, ...newSpecs]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!brandId) {
      alert('Please select a brand.')
      return
    }

    const cleanedSpecifications = specifications
      .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
      .filter((s) => s.key.length > 0 && s.value.length > 0)

    const payload: ProductInput = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      sku: sku.trim() || undefined,
      basePrice: parseFloat(basePrice) || 0,
      stock: parseInt(stock, 10) || 0,
      hasVariants,
      brandId,
      categoryIds,
      isPublished,
      isFeatured,
      isOnSale,
      images,
      variants: hasVariants ? variants : [],
      specifications: cleanedSpecifications,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* AI Assistant Generator */}
      <AiProductGenerator currentName={name} onGenerated={handleAiGenerated} />

      {/* 1. Basic Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Basic Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cordless Rotary Hammer Drill"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Slug (Optional)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated if empty"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">SKU (Stock Keeping Unit)</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. DRILL-20V-MAX"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of features, specs, and contents..."
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </section>

      {/* 2. Pricing & Inventory */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          2. Pricing & Inventory
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Base Price ({currencySymbol}) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {hasVariants ? 'Parent Stock (Info Only)' : 'Inventory Stock *'}
            </label>
            <input
              type="number"
              min="0"
              required={!hasVariants}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              disabled={hasVariants}
              className={`mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none ${
                hasVariants ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
              }`}
            />
            {hasVariants && (
              <p className="mt-1 text-xs text-slate-500">
                When variants are enabled, stock is managed individually per variant.
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <span className="font-semibold text-sm text-slate-900">Enable Product Variants</span>
              <p className="text-xs text-slate-500">
                Check this if the product comes in different sizes, colors, or configurations.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* 3. Organization (Brand & Categories) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          3. Organization
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700">Brand *</label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
          >
            <option value="" disabled>
              Select a Brand
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No categories available. Please create categories first.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 p-3 bg-slate-50">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Product Images */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          4. Product Images
        </h3>
        <ImageManager images={images} onChange={setImages} />
      </section>

      {/* 5. Visibility & Badges */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          5. Storefront Visibility
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <span className="font-semibold text-sm text-slate-900">Published</span>
              <p className="text-xs text-slate-500">Visible to customers in storefront.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <span className="font-semibold text-sm text-slate-900">Featured</span>
              <p className="text-xs text-slate-500">Showcased on homepage hero/grid.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={isOnSale}
              onChange={(e) => setIsOnSale(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <span className="font-semibold text-sm text-slate-900">On Sale</span>
              <p className="text-xs text-slate-500">Displays sale badge in catalog.</p>
            </div>
          </label>
        </div>
      </section>

      {/* 6. Product Variants (Conditional) */}
      {hasVariants && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            6. Product Variants Management
          </h3>
          <VariantManager variants={variants} onChange={setVariants} currencySymbol={currencySymbol} />
        </section>
      )}

      {/* 7. Product Specifications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          7. Specifications
        </h3>
        <SpecificationsManager specifications={specifications} onChange={setSpecifications} />
      </section>

      {/* Form Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving Product...' : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
