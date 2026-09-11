'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ExternalLink,
  Menu,
  X,
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  FileImage,
  ShoppingCart,
  Ticket,
  Truck,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [storeName, setStoreName] = useState<string>('Store')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        if (res.ok && data.success && data.settings?.storeName) {
          setStoreName(data.settings.storeName)
        }
      } catch {
        // Fallback default retained
      }
    }
    void fetchSettings()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  // On initial admin setup, render children cleanly without the admin console navigation header
  if (pathname.startsWith('/admin/setup')) {
    return <>{children}</>
  }

  const navGroups = [
    {
      group: 'Core',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Catalog',
      items: [
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: FolderTree },
        { name: 'Brands', href: '/admin/brands', icon: Tag },
        { name: 'Media Library', href: '/admin/media', icon: FileImage },
      ],
    },
    {
      group: 'Sales & Orders',
      items: [
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
        { name: 'Shipping', href: '/admin/shipping', icon: Truck },
      ],
    },
    {
      group: 'Storefront CMS',
      items: [
        { name: 'Homepage CMS', href: '/admin/homepage', icon: FileText },
        { name: 'Store Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Console Card */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 font-mono">
                  Merchant Console
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {storeName} Management
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>View Live Store</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" />
                <span>Logout</span>
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
                aria-label="Open navigation drawer"
              >
                <Menu className="h-5 w-5 text-slate-700" aria-hidden="true" />
                <span>Menu</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-4 mt-5 text-xs font-semibold">
            {navGroups.map((grp) => (
              <div key={grp.group} className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">{grp.group}:</span>
                {grp.items.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
                        active
                          ? 'bg-slate-900 text-white font-bold shadow-xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-slate-500'}`} aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop Blur Overlay */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-slate-200 animate-in slide-in-from-left duration-200">
              <div className="p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">
                      {storeName} Admin
                    </span>
                    <h2 className="text-base font-bold text-slate-900">Console Menu</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    aria-label="Close navigation drawer"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Grouped Links */}
                <div className="space-y-5">
                  {navGroups.map((grp) => (
                    <div key={grp.group} className="space-y-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono px-2">
                        {grp.group}
                      </h3>
                      <div className="space-y-1">
                        {grp.items.map((item) => {
                          const active = isActive(item.href)
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                                active
                                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-500'}`} aria-hidden="true" />
                              <span>{item.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-2">
                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  <ExternalLink className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  <span>View Live Storefront</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    void handleLogout()
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  <LogOut className="h-4 w-4 text-rose-600" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
