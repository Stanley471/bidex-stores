'use client'

import { useEffect, useState } from 'react'
import type { AnySectionConfig, SectionTheme } from '@/types/homepage'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react'

const AVAILABLE_SECTION_TYPES = [
  { type: 'hero', name: 'Hero Banner' },
  { type: 'categories', name: 'Categories Grid' },
  { type: 'flash-sale', name: 'Flash Sale Showcase' },
  { type: 'featured', name: 'Featured Products' },
  { type: 'bestsellers', name: 'Best Sellers' },
  { type: 'new-arrivals', name: 'New Arrivals' },
  { type: 'promo-banner', name: 'Promo Banner' },
  { type: 'why-choose-us', name: 'Why Choose Us Features' },
  { type: 'newsletter', name: 'Newsletter Subscription' },
]

export function HomepageBuilderView() {
  const [sections, setSections] = useState<AnySectionConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit Modal State
  const [editingSection, setEditingSection] = useState<AnySectionConfig | null>(null)
  const [editForm, setEditForm] = useState<{
    title: string
    subtitle: string
    theme: SectionTheme
    configJson: string
  }>({
    title: '',
    subtitle: '',
    theme: 'light',
    configJson: '{}',
  })

  // Add Section Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSectionType, setNewSectionType] = useState('featured')
  const [newSectionTitle, setNewSectionTitle] = useState('')

  // Media Picker Modal State
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  useEffect(() => {
    fetchSections()
  }, [])

  async function fetchSections() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/homepage')
      const data = await res.json()
      if (res.ok && data.success && Array.isArray(data.sections)) {
        setSections(data.sections)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load sections.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error connecting to server.' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEnable = async (section: AnySectionConfig) => {
    const updatedEnabled = !section.enabled
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, enabled: updatedEnabled } : s)),
    )

    try {
      const res = await fetch(`/api/admin/homepage/sections/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: updatedEnabled }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update section.')
      }
    } catch (err) {
      // Rollback
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, enabled: section.enabled } : s)),
      )
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error updating section.' })
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sections.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const newSections = [...sections]
    const [moved] = newSections.splice(index, 1)
    newSections.splice(targetIndex, 0, moved)

    // Update order indices locally
    const reordered = newSections.map((sec, idx) => ({ ...sec, order: idx + 1 }))
    setSections(reordered)

    // Save to server
    setSaving(true)
    try {
      const orderedIds = reordered.map((s) => s.id)
      const res = await fetch('/api/admin/homepage/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reorder sections.')
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save order.' })
      fetchSections() // Reset
    } finally {
      setSaving(false)
    }
  }

  const handleOpenEdit = (section: AnySectionConfig) => {
    setEditingSection(section)
    setEditForm({
      title: section.title || '',
      subtitle: section.subtitle || '',
      theme: section.theme || 'light',
      configJson: JSON.stringify(section.config || {}, null, 2),
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSection) return

    let parsedConfig = {}
    try {
      parsedConfig = JSON.parse(editForm.configJson || '{}')
    } catch {
      alert('Invalid JSON formatting in Section Configuration field.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/homepage/sections/${editingSection.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          subtitle: editForm.subtitle,
          theme: editForm.theme,
          config: parsedConfig,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save section edits.')
      }

      setEditingSection(null)
      setMessage({ type: 'success', text: 'Section configuration updated.' })
      fetchSections()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Save failed.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section from the homepage?')) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/homepage/sections/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete section.')
      }

      setMessage({ type: 'success', text: 'Section deleted.' })
      fetchSections()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed.' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newSectionType,
          title: newSectionTitle || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add section.')
      }

      setShowAddModal(false)
      setNewSectionTitle('')
      setMessage({ type: 'success', text: 'New homepage section added.' })
      fetchSections()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to add section.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const handleSelectMediaForSection = (mediaUrl: string) => {
    try {
      const current = JSON.parse(editForm.configJson || '{}')
      current.imageUrl = mediaUrl
      setEditForm((prev) => ({ ...prev, configJson: JSON.stringify(current, null, 2) }))
    } catch {
      setEditForm((prev) => ({ ...prev, configJson: JSON.stringify({ imageUrl: mediaUrl }, null, 2) }))
    }
  }

  return (
    <div className="space-y-8">
      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        title="Select Section Media Asset"
        onSelect={(media) => handleSelectMediaForSection(media.url)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Homepage CMS & Section Builder</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reorder, enable/disable, and edit content for storefront homepage sections.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-5 rounded-xl inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add Section
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

      {/* Sections List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          Configured Homepage Sections ({sections.length})
        </h2>

        {sections.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No sections configured yet. Click &quot;Add Section&quot; to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                  sec.enabled
                    ? 'border-slate-200 bg-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                {/* Left: Reorder controls & Details */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0 || saving}
                      aria-label="Move section up"
                      className="h-6 w-6 flex items-center justify-center rounded border border-slate-200 bg-slate-50 hover:bg-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 transition"
                    >
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === sections.length - 1 || saving}
                      aria-label="Move section down"
                      className="h-6 w-6 flex items-center justify-center rounded border border-slate-200 bg-slate-50 hover:bg-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 transition"
                    >
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {sec.title || sec.type.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-600 border border-slate-200">
                        {sec.type}
                      </span>
                    </div>

                    {sec.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{sec.subtitle}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Theme: <strong className="text-slate-700">{sec.theme || 'light'}</strong></span>
                      <span>Config fields: <strong className="text-slate-700">{Object.keys(sec.config || {}).length}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Toggle */}
                <div className="flex items-center gap-3 mt-3 sm:mt-0 justify-end">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={sec.enabled}
                      onChange={() => handleToggleEnable(sec)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span>{sec.enabled ? 'ON' : 'OFF'}</span>
                  </label>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(sec)}
                    className="h-8 text-xs font-bold text-slate-700 border-slate-300 inline-flex items-center gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(sec.id)}
                    aria-label="Delete section"
                    className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Section: <span className="font-mono text-emerald-600">{editingSection.type}</span>
              </h3>
              <button onClick={() => setEditingSection(null)} aria-label="Close modal" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Section Display Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Featured Products"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Section Display Subtitle</label>
                <input
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  placeholder="e.g. Handpicked items just for you"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Section Theme & Background Color Preset</label>
                <select
                  value={editForm.theme}
                  onChange={(e) => setEditForm({ ...editForm, theme: e.target.value as SectionTheme })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none font-semibold"
                >
                  <option value="primary">Primary (Slate Dark)</option>
                  <option value="dark">Pure Dark (Deep Black)</option>
                  <option value="light">Light Theme (Clean White/Slate)</option>
                  <option value="secondary">Secondary (Emerald Green)</option>
                  <option value="blue">Royal Blue Gradient</option>
                  <option value="purple">Deep Purple Gradient</option>
                  <option value="emerald">Teal Emerald Gradient</option>
                  <option value="rose">Rose Crimson Gradient</option>
                  <option value="amber">Amber Gold Gradient</option>
                </select>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Or set custom hex colors in config JSON below: <code className="font-mono bg-slate-100 px-1 rounded">&quot;backgroundColor&quot;: &quot;#1e1b4b&quot;</code>
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Section-Specific Config (JSON)</label>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                  >
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Select Image from Library</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={editForm.configJson}
                  onChange={(e) => setEditForm({ ...editForm, configJson: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  {saving ? 'Saving...' : 'Save Section'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Homepage Section</h3>
              <button onClick={() => setShowAddModal(false)} aria-label="Close modal" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Section Type *</label>
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none font-semibold"
                >
                  {AVAILABLE_SECTION_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.name} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Display Title (Optional)</label>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Special Deals"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  {saving ? 'Creating...' : 'Create Section'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
