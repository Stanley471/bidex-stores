/**
 * Database-Driven Storefront Homepage
 * 
 * Renders enabled sections dynamically from PostgreSQL database (HomepageSection model).
 * Allows merchants to configure, enable/disable, and reorder sections via /admin/homepage.
 */

import { homepageService } from '@/services/homepage.service'
import { storeSettingsService } from '@/services/store-settings.service'
import { SectionRenderer } from '@/lib/sectionRenderer'

export const revalidate = 0 // Dynamic server rendering for live CMS updates

export default async function Home() {
  // Resilient parallel SSR fetch for sections, store config, and section catalog data
  const [sectionsRes, settingsRes, dataRes] = await Promise.allSettled([
    homepageService.getEnabledHomepageSections(),
    storeSettingsService.getPublicStoreSettings(),
    homepageService.getHomepageData(),
  ])

  const enabledSections = sectionsRes.status === 'fulfilled' ? sectionsRes.value : []
  const publicSettings = settingsRes.status === 'fulfilled'
    ? settingsRes.value
    : { storeName: 'CTools Store', storeTagline: null, storeDescription: null }
  const homepageData = dataRes.status === 'fulfilled' ? dataRes.value : undefined

  return (
    <div className="w-full">
      {/* Render all enabled sections in database order with server-rendered data */}
      {enabledSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          storeConfig={{
            storeName: publicSettings.storeName,
            heroTitle: publicSettings.storeTagline || publicSettings.storeName,
            heroSubtitle: publicSettings.storeDescription || undefined,
          }}
          homepageData={homepageData}
        />
      ))}
    </div>
  )
}
