"use client"

import { useMemo, useState } from 'react'
import { BrandSchema } from '@/lib/brand/validation'
import type { BrandFormValues } from '@/types/brand'
import { Button } from '@/components/ui/button'

interface BrandFormProps {
  initialData?: BrandFormValues
  onSubmit: (values: BrandFormValues) => Promise<void>
  submitLabel: string
}

export function BrandForm({ initialData, onSubmit, submitLabel }: BrandFormProps) {
  const [form, setForm] = useState<BrandFormValues>(() => ({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    logo: initialData?.logo ?? '',
    website: initialData?.website ?? '',
    description: initialData?.description ?? '',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const inferredSlug = useMemo(() => {
    if (form.slug?.trim()) {
      return form.slug.trim()
    }

    return form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
  }, [form.name, form.slug])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setMessage(null)

    const parsed = BrandSchema.safeParse(form)

    if (!parsed.success) {
      const fieldErrors = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0] ?? 'Invalid value']),
      )
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)

    try {
      await onSubmit(parsed.data)
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage('An unexpected error occurred.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm" onSubmit={handleSubmit} noValidate>
      {message ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">{message}</div>
      ) : null}

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        <label className="space-y-1.5 text-xs font-semibold text-slate-700">
          <span>Brand Name *</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-900"
            placeholder="e.g. Bosch, DeWalt, Makita"
            required
          />
          {errors.name ? <span className="text-xs text-rose-600 block">{errors.name}</span> : null}
        </label>

        <label className="space-y-1.5 text-xs font-semibold text-slate-700">
          <span>Brand Slug</span>
          <input
            value={form.slug}
            onChange={(event) => setForm({ ...form, slug: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-900 font-mono"
            placeholder="Optional slug (auto-generated)"
          />
          <p className="text-[11px] text-slate-500 font-normal">
            Generated slug: <span className="font-mono font-bold text-slate-700">{inferredSlug || 'n/a'}</span>
          </p>
          {errors.slug ? <span className="text-xs text-rose-600 block">{errors.slug}</span> : null}
        </label>
      </div>

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        <label className="space-y-1.5 text-xs font-semibold text-slate-700">
          <span>Logo Image URL</span>
          <input
            type="url"
            value={form.logo ?? ''}
            onChange={(event) => setForm({ ...form, logo: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-900 font-mono"
            placeholder="https://example.com/logo.png"
          />
          {errors.logo ? <span className="text-xs text-rose-600 block">{errors.logo}</span> : null}
        </label>

        <label className="space-y-1.5 text-xs font-semibold text-slate-700">
          <span>Official Website URL</span>
          <input
            type="url"
            value={form.website ?? ''}
            onChange={(event) => setForm({ ...form, website: event.target.value })}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-900 font-mono"
            placeholder="https://example.com"
          />
          {errors.website ? <span className="text-xs text-rose-600 block">{errors.website}</span> : null}
        </label>

        <label className="space-y-1.5 text-xs font-semibold text-slate-700 md:col-span-2">
          <span>Description</span>
          <textarea
            value={form.description ?? ''}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            rows={4}
            className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-slate-900"
            placeholder="Optional brand overview or description..."
          />
          {errors.description ? <span className="text-xs text-rose-600 block">{errors.description}</span> : null}
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 px-7 rounded-xl w-full sm:w-auto"
        >
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
