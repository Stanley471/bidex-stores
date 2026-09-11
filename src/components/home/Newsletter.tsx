/**
 * Newsletter Section Component
 * 
 * Displays email subscription form
 */

'use client';

import { NewsletterSectionConfig } from '@/types/homepage';

interface NewsletterProps {
  config: NewsletterSectionConfig;
}

export function Newsletter({ config }: NewsletterProps) {
  return (
    <section className="py-12 px-4 bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
          {config.subtitle && (
            <p className="text-gray-300">{config.subtitle}</p>
          )}
        </div>

        {/* Newsletter Form */}
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder={config.config?.placeholder || 'Enter your email'}
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-secondary transition-colors whitespace-nowrap uppercase text-xs tracking-wider"
          >
            {config.config?.buttonText || 'Subscribe'}
          </button>
        </form>

        {/* Privacy Notice */}
        <p className="text-sm text-gray-400 text-center mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
