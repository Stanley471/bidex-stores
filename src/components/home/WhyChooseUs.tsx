'use client'

import type { ComponentType } from 'react'
import type { WhyChooseUsSectionConfig } from '@/types/homepage'
import {
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Star,
  Heart,
  Zap,
  Target,
  CheckCircle2,
  Award,
  Lock,
  ThumbsUp,
  type LucideProps,
} from 'lucide-react'

interface WhyChooseUsProps {
  config?: WhyChooseUsSectionConfig
}

const iconComponentMap: Record<string, ComponentType<LucideProps>> = {
  truck: Truck,
  shield: ShieldCheck,
  headphones: Headphones,
  'rotate-ccw': RotateCcw,
  star: Star,
  heart: Heart,
  zap: Zap,
  target: Target,
  award: Award,
  lock: Lock,
  thumbsUp: ThumbsUp,
}

const defaultFeatures = [
  {
    icon: 'truck',
    title: 'Fast & Reliable Shipping',
    description: 'Swift order dispatch with door-to-door delivery and real-time tracking.',
  },
  {
    icon: 'shield',
    title: '100% Secure Payments',
    description: 'Encrypted checkout guaranteeing safe transactions with top payment channels.',
  },
  {
    icon: 'headphones',
    title: '24/7 Dedicated Support',
    description: 'Expert customer assistance available around the clock to answer your queries.',
  },
  {
    icon: 'rotate-ccw',
    title: 'Hassle-Free Guarantee',
    description: 'Straightforward return policy with quick processing and customer satisfaction.',
  },
]

export function WhyChooseUs({ config }: WhyChooseUsProps) {
  const title = config?.title || 'Why Shop With Us'
  const subtitle = config?.subtitle || 'Experience unmatched quality, unbeatable pricing, and customer-first service.'
  const features = (config?.config?.features && config.config.features.length > 0)
    ? config.config.features
    : defaultFeatures

  return (
    <section className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50/80 border-y border-slate-200/80 overflow-hidden my-8 md:my-12">
      {/* Subtle brand color ambient glow background circles */}
      <div
        className="absolute top-0 left-1/4 h-72 w-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundColor: 'var(--brand-primary, #F68B1E)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundColor: 'var(--brand-secondary, #1B365D)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = iconComponentMap[feature.icon] || CheckCircle2

            return (
              <div
                key={index}
                className="group relative flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Icon Container with Brand Primary Dynamic Colors */}
                <div>
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 shadow-xs group-hover:scale-110 group-hover:shadow-md"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--brand-primary, #F68B1E) 12%, transparent)',
                      color: 'var(--brand-primary, #F68B1E)',
                    }}
                  >
                    <IconComponent className="h-6 w-6 transition-transform duration-300" aria-hidden="true" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom subtle accent line on hover */}
                <div
                  className="mt-6 h-1 w-0 rounded-full transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: 'var(--brand-primary, #F68B1E)' }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
