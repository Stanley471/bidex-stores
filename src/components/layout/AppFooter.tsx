'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  ArrowRight,
} from 'lucide-react'

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.438 5.168L2 22l4.975-1.306A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  )
}

interface PublicSettings {
  storeName: string
  storeDescription?: string | null
  storeTagline?: string | null
  logo?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  whatsapp?: string | null
  businessAddress?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  twitter?: string | null
  youtube?: string | null
  currencyCode?: string | null
}

export function AppFooter() {
  const pathname = usePathname()

  const [settings, setSettings] = useState<PublicSettings>({
    storeName: 'CTools Store',
    storeDescription: 'Your one-stop destination for premium quality tools and equipment.',
  })

  useEffect(() => {
    const fetchSettings = async () => {
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
    void fetchSettings()
  }, [])

  const currentYear = new Date().getFullYear()

  // Format WhatsApp Link safely
  const formatWhatsappLink = (phone?: string | null) => {
    if (!phone) return null
    const cleaned = phone.replace(/[^0-9]/g, '')
    if (!cleaned) return null
    return `https://wa.me/${cleaned}`
  }

  const whatsappUrl = formatWhatsappLink(settings.whatsapp)

  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="mt-auto relative bg-slate-950 text-slate-400 text-xs border-t-2" style={{ borderColor: 'var(--brand-primary, #F68B1E)' }}>
      {/* Top Value Proposition Bar */}
      <div className="border-b border-slate-900 bg-slate-900/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-brand-primary" style={{ color: 'var(--brand-primary, #F68B1E)' }}>
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Shipping</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Reliable nationwide delivery</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-brand-primary" style={{ color: 'var(--brand-primary, #F68B1E)' }}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verified Quality</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">100% authentic products</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-brand-primary" style={{ color: 'var(--brand-primary, #F68B1E)' }}>
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Payment</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Protected transactions</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-brand-primary" style={{ color: 'var(--brand-primary, #F68B1E)' }}>
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Easy Returns</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Hassle-free guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Store Branding & Description */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block">
              {settings.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo} alt={settings.storeName} className="h-10 max-w-[200px] object-contain" />
              ) : (
                <span className="text-lg font-extrabold text-white tracking-tight">
                  {settings.storeName}
                </span>
              )}
            </Link>

            {settings.storeTagline && (
              <p className="font-semibold text-xs tracking-wide" style={{ color: 'var(--brand-primary, #F68B1E)' }}>
                {settings.storeTagline}
              </p>
            )}

            {settings.storeDescription && (
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                {settings.storeDescription}
              </p>
            )}

            {/* Social Media Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-400 border border-slate-800 transition-all hover:bg-rose-600 hover:text-white hover:border-rose-500 hover:scale-105"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-400 border border-slate-800 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-105"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
              {settings.twitter && (
                <a
                  href={settings.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter/X"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-400 border border-slate-800 transition-all hover:bg-sky-500 hover:text-white hover:border-sky-400 hover:scale-105"
                >
                  <TwitterIcon className="h-4 w-4" />
                </a>
              )}
              {settings.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-400 border border-slate-800 transition-all hover:bg-red-600 hover:text-white hover:border-red-500 hover:scale-105"
                >
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-slate-400 border border-slate-800 transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-500 hover:scale-105"
                >
                  <WhatsappIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all">
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                  <span>Store Home</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all">
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                  <span>Products Catalog</span>
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all">
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                  <span>Saved Wishlist</span>
                </Link>
              </li>
              <li>
                <Link href="/orders" className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all">
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                  <span>Track My Orders</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 hover:text-white hover:translate-x-1 transition-all">
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                  <span>Account Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="md:col-span-4 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Contact & Location</h3>
            <ul className="space-y-3 text-xs">
              {settings.contactEmail && (
                <li className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Email Us</span>
                    <a href={`mailto:${settings.contactEmail}`} className="hover:text-white transition font-medium">
                      {settings.contactEmail}
                    </a>
                  </div>
                </li>
              )}
              {settings.contactPhone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Call Customer Service</span>
                    <a href={`tel:${settings.contactPhone}`} className="hover:text-white transition font-medium">
                      {settings.contactPhone}
                    </a>
                  </div>
                </li>
              )}
              {whatsappUrl && (
                <li className="flex items-start gap-2.5">
                  <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">WhatsApp Chat</span>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Chat with Support
                    </a>
                  </div>
                </li>
              )}
              {settings.businessAddress && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Address</span>
                    <span className="text-slate-300 leading-relaxed">{settings.businessAddress}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© {currentYear} {settings.storeName}. All rights reserved.</p>
          <p className="font-medium text-slate-600">
            Powered by <span className="text-slate-400 font-semibold">{settings.storeName}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
