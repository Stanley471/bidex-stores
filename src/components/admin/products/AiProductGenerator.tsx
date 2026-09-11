'use client'

import { useState } from 'react'
import { Sparkles, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProductSpecificationInput } from '@/lib/product/validation'

interface AiProductGeneratorProps {
  currentName: string
  onGenerated: (data: {
    name?: string
    description: string
    specifications: ProductSpecificationInput[]
  }) => void
}

export function AiProductGenerator({ currentName, onGenerated }: AiProductGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState(currentName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleOpen = () => {
    setPrompt(currentName || '')
    setError(null)
    setSuccessMessage(null)
    setIsOpen(true)
  }

  const handleGenerate = async () => {
    const trimmed = prompt.trim()
    if (!trimmed) {
      setError('Please enter a product model or title.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/ai/generate-product-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message ||
            data?.error ||
            (res.status === 504
              ? 'AI service took too long to respond. Please try again.'
              : 'AI generation failed.'),
        )
      }

      const { name: generatedName, description, specifications } = data.data

      onGenerated({
        name: generatedName || '',
        description: description || '',
        specifications: specifications || [],
      })

      const specCount = specifications?.length || 0
      setSuccessMessage(
        `Generated product name, description, and ${specCount} specification${specCount === 1 ? '' : 's'}. Review them below!`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating product details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/40 p-4 shadow-xs">
      {!isOpen ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">AI Assistant</p>
              <p className="text-xs text-slate-500">
                Instantly draft descriptions and factual specifications.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleOpen}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Generate with AI</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100/70 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-900">Generate Product Details with AI</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-600 transition cursor-pointer"
              aria-label="Close AI Generator"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Enter a rough product title or model (e.g.{' '}
            <span className="font-semibold text-slate-800">&quot;iPhone 13 128GB Red&quot;</span> or{' '}
            <span className="font-semibold text-slate-800">
              &quot;DeWalt 20V Max Cordless Drill&quot;
            </span>
            ). The AI will write a 2-4 sentence description and populate known factual specs (RAM,
            Processor, Battery, Display, etc.). Pricing, images, and visibility will remain
            untouched.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Product Title or Rough Description</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                placeholder="e.g. iPhone 13 128GB Red"
                disabled={isLoading}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
              <Button
                type="button"
                disabled={isLoading || !prompt.trim()}
                onClick={handleGenerate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-4 rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Generate Details</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
