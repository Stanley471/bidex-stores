import type { CSSProperties } from 'react'
import type { HeroSectionConfig } from '@/types/homepage'
import Link from 'next/link'
import { ShoppingBag, ShieldCheck, Truck } from 'lucide-react'

interface HeroProps {
  config: HeroSectionConfig
  storeTitle: string
  storeSubtitle: string
}

export function Hero({ config, storeTitle, storeSubtitle }: HeroProps) {
  const displayTitle = config.title?.trim() || storeTitle
  const displaySubtitle = config.subtitle?.trim() || storeSubtitle

  const customBgColor = config.config?.backgroundColor || config.config?.bgColor
  const customFrom = config.config?.gradientFrom
  const customTo = config.config?.gradientTo

  const sectionStyle: CSSProperties = {}
  if (customFrom && customTo) {
    sectionStyle.background = `linear-gradient(135deg, ${customFrom}, ${customTo})`
  } else if (customBgColor) {
    sectionStyle.backgroundColor = customBgColor
  }

  return (
    <section className="py-2.5 px-2 sm:px-4 max-w-6xl mx-auto">
      {/* Compact Jumia-Style Hero Banner Container */}
      <div
        className="relative overflow-hidden rounded-xl bg-brand-primary text-white p-5 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
        style={sectionStyle}
      >
        {/* Background Overlay */}
        {config.config?.imageUrl && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${config.config.imageUrl})` }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 space-y-2 text-center md:text-left max-w-xl">
          {/* <div className="inline-flex items-center gap-1.5 bg-black/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" aria-hidden="true" />
            <span>Official Store Deals</span>
          </div> */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-white/90 font-medium line-clamp-2">
              {displaySubtitle}
            </p>
          )}
          <div className="pt-2">
            <Link
              href={config.config?.ctaLink || '/products'}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md transition-transform hover:scale-105"
            >
              <ShoppingBag className="h-4 w-4 text-brand-primary" />
              <span>{config.config?.ctaText || 'Shop Deals Now'}</span>
            </Link>
          </div>
        </div>

        {/* Quick Value Props Badges on Desktop */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-1 gap-2 sm:gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20">
            <Truck className="h-5 w-5 text-amber-200" />
            <div>
              <p className="text-xs font-bold text-white">Fast Nationwide Delivery</p>
              <p className="text-[10px] text-white/80">Direct to your doorstep</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20">
            <ShieldCheck className="h-5 w-5 text-amber-200" />
            <div>
              <p className="text-xs font-bold text-white">Guaranteed Quality</p>
              <p className="text-[10px] text-white/80">100% Genuine Products</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
