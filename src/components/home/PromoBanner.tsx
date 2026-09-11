'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PromoBannerSectionConfig } from '@/types/homepage'
import { Tag, ArrowRight, Copy, Check } from 'lucide-react'

interface PromoBannerProps {
  config: PromoBannerSectionConfig
}

export function PromoBanner({ config }: PromoBannerProps) {
  const [copied, setCopied] = useState(false)

  const cfg = config.config || {}
  const title = config.title || 'Special Promotion'
  const subtitle = config.subtitle || 'Don’t miss out on our limited-time exclusive discounts and offers.'

  const promoCode = cfg.promoCode || 'PROMO50'
  const buttonText = cfg.buttonText || 'Shop Offer'
  const targetLink = cfg.buttonLink || cfg.link || '/products'
  const imageUrl = cfg.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop'

  // Dynamic Background styling
  const gradientFrom = cfg.gradientFrom || 'var(--brand-primary, #F68B1E)'
  const gradientTo = cfg.gradientTo || 'var(--brand-primary, #F68B1E)'
  const customBgColor = cfg.backgroundColor

  const sectionStyle = customBgColor
    ? { backgroundColor: customBgColor }
    : { background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }

  const handleCopyCode = () => {
    if (!promoCode) return
    navigator.clipboard.writeText(promoCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section className="relative overflow-hidden py-8 md:py-12 px-4 sm:px-6 lg:px-8 my-6 md:my-10">
      <div
        className="mx-auto max-w-6xl rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden shadow-2xl transition-all duration-300"
        style={sectionStyle}
      >
        {/* Ambient background blur lighting */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-black/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Content Column */}
          <div className="lg:col-span-7 space-y-5 text-white text-left">
            {/* Title & Subtitle */}
            <div className="space-y-2.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl leading-relaxed font-normal">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Promo Code & Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* Interactive Copyable Code Box */}
              {promoCode && (
                <div className="flex items-center justify-between rounded-xl bg-white/15 border border-white/25 p-1.5 pl-4 backdrop-blur-md transition-all hover:bg-white/20">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-white" />
                    <span className="text-xs uppercase tracking-wider text-white/80 font-medium">Code:</span>
                    <span className="font-mono text-sm font-bold tracking-widest text-white">{promoCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="ml-3 flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-slate-100 active:scale-95 shadow-sm cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-600" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Main Call to Action Button */}
              <Link
                href={targetLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 group/btn"
              >
                <span>{buttonText}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Image Showcase Column */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-md lg:max-w-none group">
              {/* Image Frame */}
              <div className="relative aspect-4/3 sm:aspect-16/9 lg:aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/20 bg-slate-900/40 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
