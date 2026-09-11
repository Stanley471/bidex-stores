'use client'

import { useWishlist } from '@/hooks/useWishlist'

function WishlistNavButton() {
  const { itemCount } = useWishlist()

  return (
    <Link
      href="/wishlist"
      className="relative flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100 hover:text-rose-600 transition"
      title="Saved Wishlist"
    >
      <Heart className="h-5 w-5 text-slate-700 hover:text-rose-600" aria-hidden="true" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
          {itemCount}
        </span>
      )}
    </Link>
  )
}

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { CartNavButton } from '@/components/cart/CartNavButton'
import {
  AlertTriangle,
  Settings,
  User,
  LogOut,
  Search,
  X,
  Home,
  ShoppingBag,
  Package,
  Heart,
  Info,
  PhoneCall,
  Zap,
  Hammer,
  Cog,
  Shield,
  Wrench,
  Tag,
  Car,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

function getCategoryIcon(name: string, slug: string) {
  const text = (name + ' ' + slug).toLowerCase()
  if (text.includes('power') || text.includes('drill') || text.includes('electric') || text.includes('cordless')) {
    return <Zap className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
  }
  if (text.includes('hand') || text.includes('hammer') || text.includes('pliers') || text.includes('screw')) {
    return <Hammer className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
  }
  if (text.includes('machine') || text.includes('equipment') || text.includes('generator') || text.includes('weld')) {
    return <Cog className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
  }
  if (text.includes('safety') || text.includes('protective') || text.includes('helmet') || text.includes('glove')) {
    return <Shield className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
  }
  if (text.includes('plumb') || text.includes('pipe') || text.includes('wrench') || text.includes('valve')) {
    return <Wrench className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
  }
  if (text.includes('auto') || text.includes('car') || text.includes('vehicle')) {
    return <Car className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
  }
  return <Tag className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
}

interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}

interface PublicSettings {
  storeName: string
  logo?: string | null
  isStoreActive?: boolean
}

interface CategoryItem {
  id: string
  name: string
  slug: string
  productCount?: number
}

interface AppHeaderProps {
  initialUser?: SessionUser | null
  initialSettings?: PublicSettings
}

const emptySubscribe = () => () => {}
function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function AppHeader({ initialUser, initialSettings }: AppHeaderProps = {}) {
  const router = useRouter()
  const pathname = usePathname()

  const mounted = useHasMounted()

  const [userState, setUserState] = useState<{ prop: SessionUser | null | undefined; value: SessionUser | null }>({
    prop: initialUser,
    value: initialUser ?? null,
  })
  const [settingsState, setSettingsState] = useState<{ prop: PublicSettings | undefined; value: PublicSettings }>({
    prop: initialSettings,
    value: initialSettings ?? { storeName: 'CTools Store', isStoreActive: true },
  })

  if (initialUser !== undefined && initialUser !== userState.prop) {
    setUserState({ prop: initialUser, value: initialUser })
  }

  if (initialSettings !== undefined && initialSettings !== settingsState.prop) {
    setSettingsState({ prop: initialSettings, value: initialSettings })
  }

  const user = userState.value
  const setUser = (newUser: SessionUser | null) => setUserState({ prop: userState.prop, value: newUser })
  const settings = settingsState.value
  const setSettings = (newSettings: PublicSettings) => setSettingsState({ prop: settingsState.prop, value: newSettings })
  const [loadingUser, setLoadingUser] = useState(initialUser === undefined)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<CategoryItem[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/homepage/data')
        const data = await res.json()
        if (res.ok && data.success && data.data?.categories) {
          setCategories(data.data.categories)
        }
      } catch {
        // Retain empty fallback
      }
    }
    void fetchCategories()

    if (initialUser !== undefined && initialSettings !== undefined) {
      return
    }

    const fetchPublicSettings = async () => {
      try {
        const res = await fetch('/api/settings/public')
        const data = await res.json()
        if (res.ok && data.success && data.settings) {
          setSettings(data.settings)
        }
      } catch {
        // Fallback default retained
      }
    }

    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'same-origin',
          cache: 'no-store',
        })

        if (!response.ok) {
          setUser(null)
          return
        }

        const data = await response.json()
        setUser(data.user ?? null)
      } catch {
        setUser(null)
      } finally {
        setLoadingUser(false)
      }
    }

    if (initialSettings === undefined) void fetchPublicSettings()
    if (initialUser === undefined) void fetchSession()
  }, [initialUser, initialSettings])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    const label = trimmed ? `Searching for "${trimmed}"...` : 'Loading catalog...'

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('start-navigation', { detail: { label } }))
    }

    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/products')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      })
    } finally {
      setUser(null)
      router.push('/login')
      router.refresh()
    }
  }

  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {settings.isStoreActive === false && (
        <div className="flex items-center justify-center gap-2 bg-amber-500 text-slate-950 py-2 px-4 text-xs font-bold tracking-wide">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Maintenance Notice: The storefront is currently in offline mode for updates.</span>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 lg:px-8">
          {/* Left: Branding */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {settings.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={settings.logo}
                alt={settings.storeName}
                className="h-7 sm:h-8 max-w-[110px] sm:max-w-[140px] object-contain"
              />
            ) : (
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {settings.storeName}
              </span>
            )}
          </Link>

          {/* Center: Search Bar (Responsive Mobile & Desktop) */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[180px] min-[380px]:max-w-[240px] sm:max-w-md md:max-w-lg mx-1 sm:mx-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full rounded-xl bg-slate-100/90 pl-3 pr-8 sm:pr-10 py-1.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:border-transparent focus:bg-white focus:outline-none focus:ring-0 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-brand-primary text-white hover:bg-brand-secondary transition-colors cursor-pointer"
                aria-label="Submit Search"
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* Right: Auth Icon & Cart */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {loadingUser ? (
              <Skeleton className="h-9 w-16 sm:w-20 rounded-xl" />
            ) : user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-brand-primary"
                  title="Account Dashboard"
                >
                  <User className="h-5 w-5 text-slate-700" aria-hidden="true" />
                  <span className="hidden sm:inline text-xs font-semibold">Account</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center text-slate-400 hover:text-rose-600 transition p-1"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-brand-primary"
                title="Sign in / Account"
              >
                <User className="h-5 w-5 text-slate-700" aria-hidden="true" />
                <span className="hidden sm:inline text-xs font-semibold">Account</span>
              </Link>
            )}

            <CartNavButton />

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Side Drawer Overlay (70% Viewport Width - Mounted to Document Body via Portal) */}
        {mobileMenuOpen && mounted && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] md:hidden flex justify-end">
            {/* Backdrop Overlay covering remaining 30% area */}
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Drawer Panel covering ~70% screen width */}
            <div className="relative z-10 w-[70vw] max-w-xs h-full bg-white shadow-2xl border-l border-slate-200 p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div>
                {/* Header Row with Close Button */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                    {settings.storeName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation Items with Icons */}
                <nav className="space-y-1 text-sm font-medium">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                  >
                    <Home className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                    <span>Home</span>
                  </Link>

                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                  >
                    <ShoppingBag className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                    <span>Products Catalog</span>
                  </Link>

                  <Link
                    href={user ? '/orders' : '/login'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                  >
                    <Package className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" aria-hidden="true" />
                      <span>Wishlist</span>
                    </div>
                  </Link>

                  {/* Active Categories with Goods Inside */}
                  {categories.length > 0 && (
                    <div className="pt-2 pb-1 border-t border-slate-100">
                      <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Categories
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/products?category=${cat.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                          >
                            {getCategoryIcon(cat.name, cat.slug)}
                            <span>{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company & Support Links */}
                  <div className="pt-2 border-t border-slate-100 space-y-0.5">
                    <Link
                      href="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                    >
                      <Info className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                      <span>About Us</span>
                    </Link>

                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                    >
                      <PhoneCall className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                      <span>Contact Us</span>
                    </Link>
                  </div>

                  {/* Account Section */}
                  {user ? (
                    <div className="pt-2 border-t border-slate-100 space-y-0.5">
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-bold text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Settings className="h-4 w-4" aria-hidden="true" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                      >
                        <User className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                        <span>Account Dashboard</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-100 space-y-0.5">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 hover:bg-slate-100 hover:text-brand-primary transition"
                      >
                        <User className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                        <span>Sign In / Register</span>
                      </Link>
                    </div>
                  )}
                </nav>
              </div>

              {/* Bottom Logout Button */}
              {user && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      void handleLogout()
                    }}
                    className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 font-semibold text-rose-600 hover:bg-rose-50 transition text-sm cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </header>
    </>
  )
}
