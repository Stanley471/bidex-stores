/**
 * Admin API Examples
 * 
 * These are examples of how an admin dashboard would interact with the
 * configurable homepage system. In production, these would be actual API endpoints.
 */

import {
  getEnabledSections,
  toggleSection,
  reorderSections,
  updateSectionConfig,
} from '@/lib/sectionRenderer';
import { storeConfig } from '@/config/store.config';
import type { AnySectionConfig, SectionType } from '@/types/homepage';

/**
 * EXAMPLE 1: Disable Flash Sale Section
 * 
 * Admin request: POST /api/admin/sections/disable
 * Body: { sectionId: 'flash-sale' }
 */
export function disableFlashSale() {
  const updated = toggleSection(
    storeConfig.homepageSections,
    'flash-sale',
    false
  );
  console.log('Flash sale disabled');
  console.log('Updated sections:', updated);
}

/**
 * EXAMPLE 2: Enable Promotional Banner
 * 
 * Admin request: POST /api/admin/sections/enable
 * Body: { sectionId: 'promo-banner' }
 */
export function enablePromoBanner() {
  const updated = toggleSection(
    storeConfig.homepageSections,
    'promo-banner',
    true
  );
  console.log('Promo banner enabled');
}

/**
 * EXAMPLE 3: Change Display Order
 * 
 * Admin request: POST /api/admin/sections/reorder
 * Body: { fromIndex: 2, toIndex: 5 }
 * 
 * Moves 'flash-sale' (currently 3rd) to position 6
 */
export function reorderToFrontFeaturedProducts() {
  // Move 'featured-products' to position 1
  const sections = storeConfig.homepageSections;
  const featuredIndex = sections.findIndex((s) => s.id === 'featured-products');
  if (featuredIndex !== -1) {
    const updated = reorderSections(sections, featuredIndex, 0);
    console.log('Featured products moved to front');
  }
}

/**
 * EXAMPLE 4: Update Section Configuration
 * 
 * Admin request: PATCH /api/admin/sections/update
 * Body: {
 *   sectionId: 'flash-sale',
 *   config: {
 *     title: 'Mega Sale - 60% Off',
 *     config: { displayLimit: 12, discountThreshold: 30 }
 *   }
 * }
 */
export function updateFlashSaleConfig() {
  const updated = updateSectionConfig(
    storeConfig.homepageSections,
    'flash-sale',
    {
      title: 'Mega Sale - 60% Off',
      subtitle: 'Unbeatable prices this weekend!',
      config: {
        displayLimit: 12,
        discountThreshold: 30,
      },
    }
  );
  console.log('Flash sale config updated');
}

/**
 * EXAMPLE 5: Update Newsletter Config
 * 
 * Admin might want to change newsletter placeholder or button text
 */
export function updateNewsletterConfig() {
  const updated = updateSectionConfig(
    storeConfig.homepageSections,
    'newsletter',
    {
      title: 'Join our mailing list',
      subtitle: 'Get 10% off your first order!',
      config: {
        placeholder: 'Enter your email address',
        buttonText: 'Get Discount Code',
      },
    }
  );
  console.log('Newsletter updated with discount offer');
}

/**
 * EXAMPLE 6: Add New Section
 * 
 * This would add a new testimonials section
 */
export function addTestimonialsSection() {
  const newSection = {
    id: 'testimonials',
    type: 'testimonials', // Would need to implement this type
    enabled: true,
    order: storeConfig.homepageSections.length + 1,
    title: 'What Our Customers Say',
    theme: 'light' as const,
    config: {
      displayLimit: 6,
    },
  } as unknown as AnySectionConfig;

  const updated = [...storeConfig.homepageSections, newSection];
  console.log('Testimonials section added');
  return updated;
}

/**
 * EXAMPLE 7: Get Active Section Summary
 * 
 * Admin dashboard might show which sections are active
 */
export function getSectionSummary() {
  const enabledSections = getEnabledSections(storeConfig.homepageSections);

  const summary = enabledSections.map((section) => ({
    id: section.id,
    type: section.type,
    title: section.title,
    order: section.order,
  }));

  console.log('Active sections:', summary);
  return summary;
}

/**
 * EXAMPLE 8: Temporarily Hide Multiple Sections
 * 
 * Admin might want to hide promotional sections during off-hours
 */
export function disableAllPromoSections() {
  let updated = storeConfig.homepageSections;

  ['flash-sale', 'promo-banner'].forEach((sectionId) => {
    updated = toggleSection(updated, sectionId, false);
  });

  console.log('All promotional sections disabled');
  return updated;
}

/**
 * EXAMPLE 9: Reset to Default Config
 * 
 * Admin might want to revert to a known good configuration
 */
export function resetToDefaultConfig() {
  // In a real app, you'd load from a saved template or database
  console.log('Resetting to default configuration');
  // This would trigger a reload of the default store.config.ts
}

/**
 * EXAMPLE 10: A/B Test Different Layouts
 * 
 * Test which section order performs better
 */
export function createABTestConfig() {
  // Version A: Current order
  const versionA = storeConfig.homepageSections;

  // Version B: Different order (move bestsellers up)
  const versionB = reorderSections(
    versionA,
    versionA.findIndex((s) => s.id === 'bestsellers'),
    2
  );

  console.log('Version A (control):', versionA.map((s) => s.id));
  console.log('Version B (test):', versionB.map((s) => s.id));

  // In production: Serve Version A to 50% of users, Version B to 50%
}

/**
 * HOW TO IMPLEMENT IN PRODUCTION
 * 
 * 1. Create API endpoints:
 *    - POST /api/admin/sections/toggle
 *    - POST /api/admin/sections/reorder
 *    - PATCH /api/admin/sections/update
 *    - GET /api/admin/sections
 * 
 * 2. Store configuration in database:
 *    - Save updated config to database
 *    - Load config from database instead of hardcoded file
 * 
 * 3. Admin Dashboard UI:
 *    - Drag-drop reordering
 *    - Toggle switches to enable/disable
 *    - Form to edit section settings
 *    - Preview changes before publishing
 * 
 * 4. Caching strategy:
 *    - Cache store config in-memory
 *    - Invalidate cache when config changes
 *    - Use Redis for distributed caching if needed
 * 
 * 5. Version control:
 *    - Keep history of configuration changes
 *    - Allow rollback to previous versions
 *    - Track who made changes and when
 */
