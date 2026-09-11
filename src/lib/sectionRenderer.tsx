/**
 * Homepage Section Renderer Utilities
 * 
 * Functions to render sections dynamically based on configuration
 */

import {
  AnySectionConfig,
  HeroSectionConfig,
  CategoriesSectionConfig,
  ProductSectionConfig,
  PromoBannerSectionConfig,
  WhyChooseUsSectionConfig,
  NewsletterSectionConfig,
  SECTION_TYPES,
} from '@/types/homepage';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { FlashSale } from '@/components/home/FlashSale';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BestSellers } from '@/components/home/BestSellers';
import { NewArrivals } from '@/components/home/NewArrivals';
import { PromoBanner } from '@/components/home/PromoBanner';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Newsletter } from '@/components/home/Newsletter';

import type { Product } from '@/types/product';
import type { HomepageCategoryItem } from '@/hooks/useHomepageData';

interface SectionRendererProps {
  section: AnySectionConfig;
  storeConfig?: {
    storeName?: string;
    heroTitle?: string;
    heroSubtitle?: string;
  };
  homepageData?: {
    featured?: Product[];
    bestSellers?: Product[];
    flashSale?: Product[];
    newArrivals?: Product[];
    categories?: HomepageCategoryItem[];
  };
}

/**
 * Component to render individual sections
 * Dynamically renders the appropriate component based on section type
 */
export function SectionRenderer({ section, storeConfig, homepageData }: SectionRendererProps) {
  // Only render if section is enabled
  if (!section.enabled) {
    return null;
  }

  switch (section.type) {
    case SECTION_TYPES.HERO:
      return (
        <Hero
          config={section as unknown as HeroSectionConfig}
          storeTitle={storeConfig?.heroTitle || storeConfig?.storeName || 'Welcome'}
          storeSubtitle={storeConfig?.heroSubtitle || 'Discover amazing products'}
        />
      );

    case SECTION_TYPES.CATEGORIES:
      return (
        <Categories
          config={section as unknown as CategoriesSectionConfig}
          categories={homepageData?.categories}
        />
      );

    case SECTION_TYPES.FLASH_SALE:
      return (
        <FlashSale
          config={section as unknown as ProductSectionConfig}
          products={homepageData?.flashSale}
        />
      );

    case SECTION_TYPES.FEATURED:
      return (
        <FeaturedProducts
          config={section as unknown as ProductSectionConfig}
          products={homepageData?.featured}
        />
      );

    case SECTION_TYPES.BESTSELLERS:
      return (
        <BestSellers
          config={section as unknown as ProductSectionConfig}
          products={homepageData?.bestSellers}
        />
      );

    case SECTION_TYPES.NEW_ARRIVALS:
      return (
        <NewArrivals
          config={section as unknown as ProductSectionConfig}
          products={homepageData?.newArrivals}
        />
      );

    case SECTION_TYPES.PROMO_BANNER:
      return <PromoBanner config={section as unknown as PromoBannerSectionConfig} />;

    case SECTION_TYPES.WHY_CHOOSE_US:
      return <WhyChooseUs config={section as unknown as WhyChooseUsSectionConfig} />;

    case SECTION_TYPES.NEWSLETTER:
      return <Newsletter config={section as unknown as NewsletterSectionConfig} />;

    default:
      console.warn(`Unknown section type`);
      return null;
  }
}

/**
 * Get enabled sections sorted by order
 */
export function getEnabledSections(sections: AnySectionConfig[]): AnySectionConfig[] {
  return sections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
}

/**
 * Update section visibility
 * (Useful for future admin functionality)
 */
export function toggleSection(
  sections: AnySectionConfig[],
  sectionId: string,
  enabled: boolean
): AnySectionConfig[] {
  return sections.map((section) =>
    section.id === sectionId ? { ...section, enabled } : section
  );
}

/**
 * Reorder sections
 * (Useful for future admin functionality)
 */
export function reorderSections(
  sections: AnySectionConfig[],
  fromIndex: number,
  toIndex: number
): AnySectionConfig[] {
  const updated = [...sections];
  const [removed] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, removed);

  // Update order numbers
  return updated.map((section, index) => ({
    ...section,
    order: index + 1,
  }));
}

/**
 * Update section configuration
 * (Useful for future admin functionality)
 */
export function updateSectionConfig(
  sections: AnySectionConfig[],
  sectionId: string,
  newConfig: Partial<AnySectionConfig>
): AnySectionConfig[] {
  return sections.map((section) =>
    section.id === sectionId ? { ...section, ...newConfig } as AnySectionConfig : section
  );
}
