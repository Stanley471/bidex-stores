'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Address } from '@/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/currency'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { ProductCard } from '@/components/products/ProductCard'
import {
  Package,
  MapPin,
  User,
  Heart,
  Ticket,
  LogOut,
  Plus,
  Check,
  Trash2,
  Edit2,
  Copy,
  Lock,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import type { Product } from '@/types/product'

interface OrderItemSnapshot {
  id: string
  productNameSnapshot: string
  quantity: number
  unitPrice: number | string
}

interface OrderHistoryItem {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  grandTotal: number | string
  createdAt: string
  items?: OrderItemSnapshot[]
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
}

interface CustomerDashboardClientProps {
  initialUser: UserProfile
  initialOrders: OrderHistoryItem[]
  currencyCode?: string
}

interface CouponItem {
  id: string
  code: string
  description?: string | null
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minimumOrderAmount?: number
  maximumDiscount?: number | null
  expiresAt?: string | null
}

const statusBadgeStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  SHIPPED: 'bg-sky-100 text-sky-800 border-sky-300',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300',
  REFUNDED: 'bg-slate-100 text-slate-800 border-slate-300',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CustomerDashboardClient({
  initialUser,
  initialOrders,
  currencyCode = 'NGN',
}: CustomerDashboardClientProps) {
  const router = useRouter()
  const { wishlist, wishlistIds, removeFromWishlist, itemCount: wishlistCount } = useWishlist()
  const { addItem, openCart } = useCart()

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'account' | 'wishlist' | 'coupons'>('orders')

  // Orders State (SSR Initialized)
  const [orders] = useState<OrderHistoryItem[]>(initialOrders)

  // User Profile State
  const [user, setUser] = useState<UserProfile>(initialUser)
  const [nameInput, setNameInput] = useState(initialUser.name)
  const [emailInput, setEmailInput] = useState(initialUser.email)
  const [phoneInput, setPhoneInput] = useState(initialUser.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Address Management State
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressSaving, setAddressSaving] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)

  // Address Form State
  const [addrFirstName, setAddrFirstName] = useState('')
  const [addrLastName, setAddrLastName] = useState('')
  const [addrPhone, setAddrPhone] = useState('')
  const [addrCountry, setAddrCountry] = useState('United States')
  const [addrState, setAddrState] = useState('')
  const [addrCity, setAddrCity] = useState('')
  const [addrLine1, setAddrLine1] = useState('')
  const [addrLine2, setAddrLine2] = useState('')
  const [addrPostalCode, setAddrPostalCode] = useState('')

  // Wishlist Products State for Guest / Hydrated View
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>(wishlist)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Coupons State
  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Fetch Addresses on Demand
  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true)
    try {
      const res = await fetch('/api/addresses')
      const data = await res.json()
      if (res.ok && data.success) {
        setAddresses(data.addresses || [])
      }
    } catch {
      // Ignore error
    } finally {
      setAddressesLoading(false)
    }
  }, [])

  // Fetch Coupons on Demand
  const loadCoupons = useCallback(async () => {
    setCouponsLoading(true)
    try {
      const res = await fetch('/api/coupons')
      const data = await res.json()
      if (res.ok && data.success) {
        setCoupons(data.coupons || [])
      }
    } catch {
      // Ignore error
    } finally {
      setCouponsLoading(false)
    }
  }, [])

  // Load wishlist items if state empty
  useEffect(() => {
    if (activeTab === 'wishlist') {
      if (wishlist.length > 0) {
        setWishlistProducts(wishlist)
      } else if (wishlistIds.length > 0) {
        setWishlistLoading(true)
        fetch('/api/products')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data?.products)) {
              const matched = data.data.products.filter((p: Product) => wishlistIds.includes(p.id))
              setWishlistProducts(matched)
            }
          })
          .catch(() => {})
          .finally(() => setWishlistLoading(false))
      } else {
        setWishlistProducts([])
      }
    }
  }, [activeTab, wishlist, wishlistIds])

  useEffect(() => {
    if (activeTab === 'addresses') void loadAddresses()
    if (activeTab === 'coupons') void loadCoupons()
  }, [activeTab, loadAddresses, loadCoupons])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage(null)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput,
          email: emailInput,
          phone: phoneInput,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile.')
      }
      setUser((prev) => ({ ...prev, name: nameInput, email: emailInput, phone: phoneInput }))
      setProfileMessage({ type: 'success', text: 'Profile details updated successfully!' })
    } catch (err) {
      setProfileMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to update profile.' })
    } finally {
      setProfileSaving(false)
    }
  }

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordMessage(null)
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update password.')
      }
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err instanceof Error ? err.message : 'Unable to change password.' })
    } finally {
      setPasswordSaving(false)
    }
  }

  // Address Form Reset & Open
  const openAddressForm = (addr?: Address) => {
    setAddressError(null)
    if (addr) {
      setEditingAddress(addr)
      setAddrFirstName(addr.firstName)
      setAddrLastName(addr.lastName)
      setAddrPhone(addr.phone || '')
      setAddrCountry(addr.country)
      setAddrState(addr.state)
      setAddrCity(addr.city)
      setAddrLine1(addr.addressLine1)
      setAddrLine2(addr.addressLine2 || '')
      setAddrPostalCode(addr.postalCode)
    } else {
      setEditingAddress(null)
      setAddrFirstName('')
      setAddrLastName('')
      setAddrPhone(user.phone || '')
      setAddrCountry('United States')
      setAddrState('')
      setAddrCity('')
      setAddrLine1('')
      setAddrLine2('')
      setAddrPostalCode('')
    }
    setAddressModalOpen(true)
  }

  // Save Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressSaving(true)
    setAddressError(null)

    const payload = {
      firstName: addrFirstName.trim(),
      lastName: addrLastName.trim(),
      phone: addrPhone.trim() || undefined,
      country: addrCountry.trim(),
      state: addrState.trim(),
      city: addrCity.trim(),
      addressLine1: addrLine1.trim(),
      addressLine2: addrLine2.trim() || undefined,
      postalCode: addrPostalCode.trim(),
    }

    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : '/api/addresses'
      const method = editingAddress ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save address.')
      }

      setAddressModalOpen(false)
      await loadAddresses()
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Unable to save address.')
    } finally {
      setAddressSaving(false)
    }
  }

  // Set Primary Default Address
  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: 'PATCH' })
      const data = await res.json()
      if (res.ok && data.success) {
        await loadAddresses()
      }
    } catch {
      // Ignore
    }
  }

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved address?')) return
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        await loadAddresses()
      }
    } catch {
      // Ignore
    }
  }

  // Copy Coupon Code
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  // Wishlist Move to Cart
  const handleWishlistAddToCart = async (product: Product) => {
    await addItem(product, 1)
    await removeFromWishlist(product.id)
    openCart()
  }

  return (
    <div className="min-h-screen bg-slate-50/80 pb-16 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* User Account Header Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 z-10">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-brand-primary text-white text-xl sm:text-2xl font-bold shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back, {user.name}!
                </h1>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {user.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto z-10">
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs">
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Total Orders</span>
                <span className="font-extrabold text-slate-900 text-sm">{orders.length}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="block text-slate-400 font-semibold uppercase text-[10px]">Saved Wishlist</span>
                <span className="font-extrabold text-slate-900 text-sm">{wishlistCount}</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-xl border-slate-300 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 font-bold gap-2 text-xs"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-2 sm:p-2.5 shadow-xs lg:sticky lg:top-20">
            <nav className="flex flex-col space-y-1 text-xs font-semibold w-full">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition w-full cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Orders</span>
                {orders.length > 0 && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition w-full cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Saved Addresses</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition w-full cursor-pointer ${
                  activeTab === 'account'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Account Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition w-full cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500/30" />
                <span>My Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition w-full cursor-pointer ${
                  activeTab === 'coupons'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Ticket className="h-4 w-4 text-amber-500" />
                <span>My Coupons</span>
              </button>
            </nav>
          </aside>

          {/* Main Section Content Area */}
          <main className="lg:col-span-9 min-h-[480px]">
            {/* TAB 1: ORDERS (SSR LANDING) */}
            {activeTab === 'orders' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order History</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing your recent orders placed on the store.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} total
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Package className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No orders found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      You haven’t placed any orders yet. Explore our product catalog and start shopping!
                    </p>
                    <Link href="/products" className="inline-block pt-2">
                      <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-6">
                        Browse Products Catalog
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusClass = statusBadgeStyles[order.status] || statusBadgeStyles.PENDING
                      const grandTotalNum = Number(order.grandTotal)

                      return (
                        <div
                          key={order.id}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 hover:bg-white hover:shadow-md transition-all duration-200"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-mono text-sm font-extrabold text-slate-900">
                                {order.orderNumber}
                              </span>
                              <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold border ${statusClass}`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                              <span>Date: <strong className="text-slate-700">{formatDate(order.createdAt)}</strong></span>
                              {order.items && order.items.length > 0 && (
                                <span>Items: <strong className="text-slate-700">{order.items.length}</strong></span>
                              )}
                              <span>Total: <strong className="text-brand-primary text-sm font-bold">{formatCurrency(grandTotalNum, currencyCode)}</strong></span>
                            </div>
                          </div>

                          <Link href={`/orders/${order.id}`} className="shrink-0">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl font-bold gap-1 text-xs hover:bg-slate-900 hover:text-white transition cursor-pointer">
                              <span>View Details</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Saved Addresses</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage your delivery shipping addresses for fast checkout.
                    </p>
                  </div>

                  <Button
                    onClick={() => openAddressForm()}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Address</span>
                  </Button>
                </div>

                {addressesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-36 rounded-2xl" />
                    <Skeleton className="h-36 rounded-2xl" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <MapPin className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No saved addresses</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add a delivery address to complete your checkout process quickly.
                    </p>
                    <Button onClick={() => openAddressForm()} className="bg-slate-900 text-white font-bold text-xs rounded-xl px-6">
                      Add Address Now
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                          addr.isDefault
                            ? 'border-brand-primary/60 bg-amber-50/30 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-900">
                              {addr.firstName} {addr.lastName}
                            </span>
                            {addr.isDefault && (
                              <span className="rounded-full bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                Primary Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          </p>
                          <p className="text-xs text-slate-600">
                            {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                          </p>
                          {addr.phone && (
                            <p className="text-xs text-slate-500 font-mono mt-1">📞 {addr.phone}</p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-slate-600 hover:text-brand-primary transition"
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Default Address
                            </span>
                          )}

                          <div className="flex items-center gap-3 ml-auto">
                            <button
                              type="button"
                              onClick={() => openAddressForm(addr)}
                              className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ACCOUNT DETAILS */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Profile Information Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personal Information</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update your account name, email address, and contact number.
                    </p>
                  </div>

                  {profileMessage && (
                    <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {profileMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <span>{profileMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={profileSaving}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-6"
                    >
                      {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                    </Button>
                  </form>
                </div>

                {/* Change Password Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security & Password</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Change your account password to ensure maximum security.
                      </p>
                    </div>
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>

                  {passwordMessage && (
                    <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {passwordMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <span>{passwordMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={passwordSaving}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-6"
                    >
                      {passwordSaving ? 'Updating Password...' : 'Update Password'}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Saved Wishlist</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All your saved items ready to add to cart or purchase.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {wishlistProducts.length} Saved
                  </span>
                </div>

                {wishlistLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                      <Heart className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Explore our products and tap the heart icon on any product to save it for later.
                    </p>
                    <Link href="/products" className="inline-block pt-2">
                      <Button className="bg-slate-900 text-white font-bold text-xs rounded-xl px-6">
                        Explore Catalog
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistProducts.map((product) => (
                      <div
                        key={product.id}
                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs hover:shadow-md transition duration-200"
                      >
                        <ProductCard product={product} />

                        <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                          <Button
                            size="sm"
                            onClick={() => void handleWishlistAddToCart(product)}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm cursor-pointer"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            <span>Add to Cart</span>
                          </Button>

                          <button
                            type="button"
                            onClick={() => void removeFromWishlist(product.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition shrink-0 cursor-pointer"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: COUPONS */}
            {activeTab === 'coupons' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Available Store Coupons</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Valid promo discount codes available for your next order.
                    </p>
                  </div>
                  <Ticket className="h-5 w-5 text-amber-500" />
                </div>

                {couponsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                      <Ticket className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">No active coupons available</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Check back soon for upcoming store promotions and discount offers!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="relative flex flex-col justify-between rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-5 transition hover:shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-base font-extrabold text-amber-900 tracking-wider">
                              {coupon.code}
                            </span>
                            <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase">
                              {coupon.discountType === 'PERCENTAGE'
                                ? `${coupon.discountValue}% OFF`
                                : `${formatCurrency(coupon.discountValue, currencyCode)} OFF`}
                            </span>
                          </div>

                          {coupon.description && (
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              {coupon.description}
                            </p>
                          )}

                          {coupon.minimumOrderAmount && coupon.minimumOrderAmount > 0 ? (
                            <p className="text-[11px] text-slate-500">
                              Min. spend: <strong className="text-slate-800">{formatCurrency(coupon.minimumOrderAmount, currencyCode)}</strong>
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">
                            {coupon.expiresAt ? `Exp: ${formatDate(coupon.expiresAt)}` : 'No Expiry'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopyCoupon(coupon.code)}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600 active:scale-95 shadow-xs cursor-pointer"
                          >
                            {copiedCode === coupon.code ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Address Form Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                ✕
              </button>
            </div>

            {addressError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                {addressError}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={addrFirstName}
                    onChange={(e) => setAddrFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={addrLastName}
                    onChange={(e) => setAddrLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">State / Province *</label>
                  <input
                    type="text"
                    required
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={addrPostalCode}
                    onChange={(e) => setAddrPostalCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={addrCountry}
                    onChange={(e) => setAddrCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddressModalOpen(false)}
                  className="rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addressSaving}
                  className="bg-slate-900 text-white font-bold rounded-xl px-6"
                >
                  {addressSaving ? 'Saving...' : editingAddress ? 'Save Changes' : 'Create Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
