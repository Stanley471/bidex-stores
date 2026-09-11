'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { Image as ImageIcon, Coins } from 'lucide-react'
import { SUPPORTED_CURRENCIES, getCurrencyOption } from '@/lib/currency'

interface StoreSettingsData {
  storeName: string
  storeDescription: string | null
  storeTagline: string | null
  logo: string | null
  favicon: string | null
  contactEmail: string | null
  contactPhone: string | null
  whatsapp: string | null
  businessAddress: string | null
  currencyCode: string
  currencySymbol: string
  primaryColor: string
  secondaryColor: string
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  twitter: string | null
  youtube: string | null
  isStoreActive: boolean
  acceptOrders: boolean
  notificationsEnabled: boolean
  senderName: string | null
  senderEmail: string | null
  merchantNotificationEmail: string | null
}

export function StoreSettingsView() {
  const [form, setForm] = useState<StoreSettingsData>({
    storeName: 'CTools Store',
    storeDescription: '',
    storeTagline: '',
    logo: '',
    favicon: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    businessAddress: '',
    currencyCode: 'NGN',
    currencySymbol: '₦',
    primaryColor: '#F68B1E',
    secondaryColor: '#FF6600',
    instagram: '',
    facebook: '',
    tiktok: '',
    twitter: '',
    youtube: '',
    isStoreActive: true,
    acceptOrders: true,
    notificationsEnabled: true,
    senderName: 'CTools Store',
    senderEmail: '',
    merchantNotificationEmail: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Media Picker Modal State
  const [pickerTarget, setPickerTarget] = useState<'logo' | 'favicon' | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        const data = await res.json()

        if (!ignore && res.ok && data.success && data.settings) {
          const s = data.settings
          setForm({
            storeName: s.storeName || '',
            storeDescription: s.storeDescription || '',
            storeTagline: s.storeTagline || '',
            logo: s.logo || '',
            favicon: s.favicon || '',
            contactEmail: s.contactEmail || '',
            contactPhone: s.contactPhone || '',
            whatsapp: s.whatsapp || '',
            businessAddress: s.businessAddress || '',
            currencyCode: s.currencyCode || 'NGN',
            currencySymbol: s.currencySymbol || '₦',
            primaryColor: s.primaryColor || '#F68B1E',
            secondaryColor: s.secondaryColor || '#FF6600',
            instagram: s.instagram || '',
            facebook: s.facebook || '',
            tiktok: s.tiktok || '',
            twitter: s.twitter || '',
            youtube: s.youtube || '',
            isStoreActive: s.isStoreActive ?? true,
            acceptOrders: s.acceptOrders ?? true,
            notificationsEnabled: s.notificationsEnabled ?? true,
            senderName: s.senderName || '',
            senderEmail: s.senderEmail || '',
            merchantNotificationEmail: s.merchantNotificationEmail || '',
          })
        }
      } catch {
        if (!ignore) {
          setMessage({ type: 'error', text: 'Failed to connect to server.' })
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadSettings()
    return () => {
      ignore = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update store settings.')
      }

      setMessage({ type: 'success', text: data.message || 'Settings saved successfully.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error saving settings.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        title={pickerTarget === 'logo' ? 'Select Store Logo' : 'Select Store Favicon'}
        onSelect={(media) => {
          if (pickerTarget === 'logo') {
            setForm((prev) => ({ ...prev, logo: media.url }))
          } else if (pickerTarget === 'favicon') {
            setForm((prev) => ({ ...prev, favicon: media.url }))
          }
        }}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure identity, currency, contact information, branding, social channels, and order behavior.
          </p>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-6 rounded-xl"
        >
          {saving ? 'Saving...' : 'Save Settings'}
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

      {/* Section 1: Store Information */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          1. Store Identity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Store Name *</label>
            <input
              type="text"
              required
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              placeholder="e.g. CTools Store"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Tagline / Slogan</label>
            <input
              type="text"
              value={form.storeTagline || ''}
              onChange={(e) => setForm({ ...form, storeTagline: e.target.value })}
              placeholder="e.g. Professional Quality Tools & Accessories"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700">Store Description</label>
            <textarea
              rows={2}
              value={form.storeDescription || ''}
              onChange={(e) => setForm({ ...form, storeDescription: e.target.value })}
              placeholder="Brief description of your store for footer and SEO metadata"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Logo Image URL</label>
              <button
                type="button"
                onClick={() => setPickerTarget('logo')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Choose Media</span>
              </button>
            </div>
            <input
              type="text"
              value={form.logo || ''}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="e.g. /logo.png or https://..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Favicon URL</label>
              <button
                type="button"
                onClick={() => setPickerTarget('favicon')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Choose Media</span>
              </button>
            </div>
            <input
              type="text"
              value={form.favicon || ''}
              onChange={(e) => setForm({ ...form, favicon: e.target.value })}
              placeholder="e.g. /favicon.ico"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Store Currency Configuration */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Store Currency & Regional Formatting
            </h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Active: {form.currencyCode} ({form.currencySymbol})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Primary Store Currency *</label>
            <select
              value={form.currencyCode}
              onChange={(e) => {
                const opt = getCurrencyOption(e.target.value)
                setForm({
                  ...form,
                  currencyCode: e.target.value,
                  currencySymbol: opt.symbol,
                })
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 font-semibold focus:border-slate-900 focus:outline-none"
            >
              {SUPPORTED_CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 pt-1">
              Select the default currency used across admin reporting, product prices, and checkout.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Currency Symbol Override</label>
            <input
              type="text"
              value={form.currencySymbol}
              onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
              placeholder="e.g. ₦, $, €, £"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 font-mono focus:border-slate-900 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 pt-1">
              Visual symbol displayed in price tags across storefront components.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Contact Information */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          3. Business & Contact Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Contact Email</label>
            <input
              type="email"
              value={form.contactEmail || ''}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="support@ctools.com"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Contact Phone</label>
            <input
              type="text"
              value={form.contactPhone || ''}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="+234 800 123 4567"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">WhatsApp Number</label>
            <input
              type="text"
              value={form.whatsapp || ''}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="+234 800 123 4567"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="font-semibold text-slate-700">Physical Business Address</label>
            <input
              type="text"
              value={form.businessAddress || ''}
              onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
              placeholder="12 Commercial Avenue, Ikeja, Lagos, Nigeria"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Branding Colors */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          4. Theme & Branding Colors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <label className="font-semibold text-slate-700">Primary Color (Hex)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="h-10 w-12 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                placeholder="#0f172a"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono uppercase focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-slate-700">Secondary Color (Hex)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                className="h-10 w-12 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={form.secondaryColor}
                onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                placeholder="#10b981"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono uppercase focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Social Media Links */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          5. Social Media Profiles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Instagram URL</label>
            <input
              type="text"
              value={form.instagram || ''}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="https://instagram.com/ctools"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Facebook URL</label>
            <input
              type="text"
              value={form.facebook || ''}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              placeholder="https://facebook.com/ctools"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">TikTok URL</label>
            <input
              type="text"
              value={form.tiktok || ''}
              onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
              placeholder="https://tiktok.com/@ctools"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">X / Twitter URL</label>
            <input
              type="text"
              value={form.twitter || ''}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              placeholder="https://x.com/ctools"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">YouTube URL</label>
            <input
              type="text"
              value={form.youtube || ''}
              onChange={(e) => setForm({ ...form, youtube: e.target.value })}
              placeholder="https://youtube.com/@ctools"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 6: Store Behavior & Order Controls */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          6. Store Operations & Order Acceptance Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300">
            <input
              type="checkbox"
              checked={form.isStoreActive}
              onChange={(e) => setForm({ ...form, isStoreActive: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <p className="font-bold text-slate-900">Store Active Mode</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When active, the storefront catalog is open to public browsing.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300">
            <input
              type="checkbox"
              checked={form.acceptOrders}
              onChange={(e) => setForm({ ...form, acceptOrders: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
            />
            <div>
              <p className="font-bold text-slate-900">Accept New Checkout Orders</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When disabled, customers can browse products but order placement is rejected server-side.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Section 7: Email & Customer Notifications */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          7. Email & Customer Notifications Settings
        </h2>

        <div className="space-y-4 text-xs">
          <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300">
            <input
              type="checkbox"
              checked={form.notificationsEnabled}
              onChange={(e) => setForm({ ...form, notificationsEnabled: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div>
              <span className="font-bold text-slate-900 block text-sm">Enable Automated Email Notifications</span>
              <span className="text-slate-500">
                When enabled, the platform automatically sends order confirmations, payment receipts, status updates, and merchant inventory alerts.
              </span>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Notification Sender Name</label>
              <input
                type="text"
                value={form.senderName || ''}
                onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                placeholder="e.g. CTools Store Support"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Notification Sender Email</label>
              <input
                type="email"
                value={form.senderEmail || ''}
                onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
                placeholder="noreply@ctools.store"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Merchant Alert Email</label>
              <input
                type="email"
                value={form.merchantNotificationEmail || ''}
                onChange={(e) => setForm({ ...form, merchantNotificationEmail: e.target.value })}
                placeholder="admin@ctools.store"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm h-12 px-8 rounded-xl"
        >
          {saving ? 'Saving Changes...' : 'Save Store Settings'}
        </Button>
      </div>
    </form>
  )
}
