'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Upload, X } from 'lucide-react'

export interface MediaItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  publicUrl: string
  altText?: string | null
  createdAt: string
}

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: { url: string; altText?: string }) => void
  title?: string
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [altTextUpload, setAltTextUpload] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    const load = async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const url = `/api/admin/media?page=1&limit=30${search ? `&search=${encodeURIComponent(search)}` : ''}`
        const res = await fetch(url)
        const data = await res.json()
        if (active && res.ok && data.success && Array.isArray(data.items)) {
          setItems(data.items)
        } else if (active) {
          setErrorMsg(data.message || 'Failed to load media assets.')
        }
      } catch {
        if (active) setErrorMsg('Error connecting to media service.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [isOpen, search])

  const handleUpload = async () => {
    if (!fileToUpload) return

    setUploading(true)
    setErrorMsg(null)

    try {
      const formData = new FormData()
      formData.append('file', fileToUpload)
      if (altTextUpload.trim()) {
        formData.append('altText', altTextUpload.trim())
      }

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Upload failed.')
      }

      setFileToUpload(null)
      setAltTextUpload('')
      setActiveTab('library')
      if (data.media?.publicUrl) {
        onSelect({ url: data.media.publicUrl, altText: data.media.altText || undefined })
        onClose()
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close modal" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Media Library</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload New</span>
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium flex-shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Media Library */}
        {activeTab === 'library' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media by filename or description..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none flex-shrink-0"
            />

            <div className="flex-1 overflow-y-auto min-h-[250px] border border-slate-100 rounded-2xl p-3 bg-slate-50">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading assets...</div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No media assets found. Switch to &quot;Upload New&quot; to add images.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelect({ url: item.publicUrl, altText: item.altText || undefined })
                        onClose()
                      }}
                      className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden cursor-pointer hover:border-slate-900 hover:shadow-md transition"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.publicUrl}
                        alt={item.altText || item.originalName}
                        className="h-full w-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 transition text-white text-[10px]">
                        <p className="font-bold truncate">{item.originalName}</p>
                        <p className="text-[9px] text-slate-300">{(item.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload New */}
        {activeTab === 'upload' && (
          <div className="flex-1 space-y-4 text-xs overflow-y-auto">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Select Image File (JPEG, PNG, WEBP, GIF, SVG — Max 5MB)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Alt Text / Description (Optional)</label>
              <input
                type="text"
                value={altTextUpload}
                onChange={(e) => setAltTextUpload(e.target.value)}
                placeholder="e.g. Hero banner promoting summer tools sale"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!fileToUpload || uploading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-5 rounded-xl"
              >
                {uploading ? 'Uploading to Cloudinary...' : 'Upload & Select'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 flex-shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
