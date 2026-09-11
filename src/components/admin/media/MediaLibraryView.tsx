'use client'

import { useEffect, useState } from 'react'
import type { MediaItem } from './MediaPicker'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Trash2, Upload, X } from 'lucide-react'

export function MediaLibraryView() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadAlt, setUploadAlt] = useState('')
  const [uploading, setUploading] = useState(false)

  // Edit Metadata Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [editAltText, setEditAltText] = useState('')

  const refreshMedia = async () => {
    setLoading(true)
    try {
      const url = `/api/admin/media?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok && data.success && Array.isArray(data.items)) {
        setItems(data.items)
        setTotalPages(data.totalPages || 1)
        setTotalCount(data.total || 0)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch media assets.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error connecting to server.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const loadMedia = async () => {
      setLoading(true)
      try {
        const url = `/api/admin/media?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`
        const res = await fetch(url)
        const data = await res.json()
        if (active && res.ok && data.success && Array.isArray(data.items)) {
          setItems(data.items)
          setTotalPages(data.totalPages || 1)
          setTotalCount(data.total || 0)
        } else if (active) {
          setMessage({ type: 'error', text: data.message || 'Failed to fetch media assets.' })
        }
      } catch {
        if (active) setMessage({ type: 'error', text: 'Error connecting to server.' })
      } finally {
        if (active) setLoading(false)
      }
    }
    loadMedia()
    return () => {
      active = false
    }
  }, [page, search])

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) return

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      if (uploadAlt.trim()) {
        formData.append('altText', uploadAlt.trim())
      }

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Upload failed.')
      }

      setShowUploadModal(false)
      setUploadFile(null)
      setUploadAlt('')
      setMessage({ type: 'success', text: 'Media asset uploaded to Cloudinary.' })
      refreshMedia()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return

    setDeletingId(id)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete asset.')
      }

      setMessage({ type: 'success', text: 'Media asset deleted successfully.' })
      refreshMedia()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed.' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item)
    setEditAltText(item.altText || '')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      const res = await fetch(`/api/admin/media/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText: editAltText }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update metadata.')
      }

      setEditingItem(null)
      setMessage({ type: 'success', text: 'Media metadata updated.' })
      refreshMedia()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Update failed.' })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Centralized Media Library</h1>
          <p className="text-xs text-slate-500 mt-1">
          Upload, view, and reuse store assets backed by Cloudinary ({totalCount} total assets).
          </p>
        </div>

        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-5 rounded-xl inline-flex items-center gap-1.5"
        >
          <Upload className="h-4 w-4" aria-hidden="true" /> Upload Media
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-2xl border p-4 text-xs font-medium ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Controls & Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search media by filename or description..."
            className="w-full sm:w-80 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
          />

          <span className="text-xs font-semibold text-slate-500">
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden p-2 space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No media assets found. Upload images to populate your library.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-400 transition"
              >
                <div className="aspect-square w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.publicUrl}
                    alt={item.altText || item.originalName}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                  <span className="absolute top-2 right-2 rounded bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white font-mono uppercase">
                    {item.mimeType.split('/')[1] || 'img'}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 truncate" title={item.originalName}>
                      {item.originalName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(item.size / 1024).toFixed(1)} KB • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    {item.altText && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-1 mt-1">{item.altText}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" aria-hidden="true" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="font-bold text-rose-600 hover:text-rose-800 disabled:opacity-30 inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous Page
            </Button>
            <span className="font-medium text-slate-600">
              Showing page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next Page
            </Button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload Media to Cloudinary</h3>
              <button onClick={() => setShowUploadModal(false)} aria-label="Close modal" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Image File * (JPEG, PNG, WEBP, GIF, SVG — Max 5MB)</label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Alt Text / Description (Optional)</label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="e.g. CTools brand logo"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!uploadFile || uploading} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  {uploading ? 'Uploading...' : 'Upload Asset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Asset Metadata</h3>
              <button onClick={() => setEditingItem(null)} aria-label="Close modal" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Filename</label>
                <input
                  type="text"
                  disabled
                  value={editingItem.originalName}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Public URL</label>
                <input
                  type="text"
                  readOnly
                  value={editingItem.publicUrl}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 font-mono text-[10px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Alt Text / Description</label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="e.g. Main storefront banner"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
