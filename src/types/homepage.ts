


/**
 * Homepage Configuration Types
 * Defines the structure for the configurable homepage system
 */

export type SectionTheme = 'light' | 'dark' | 'primary' | 'secondary';
export type ProductSource = 'featured' | 'bestsellers' | 'new' | 'discounted' | 'manual';

export const SECTION_TYPES = {
  HERO: 'hero',
  CATEGORIES: 'categories',
  FLASH_SALE: 'flash-sale',
  FEATURED: 'featured',
  BESTSELLERS: 'bestsellers',
  NEW_ARRIVALS: 'new-arrivals',
  PROMO_BANNER: 'promo-banner',
  WHY_CHOOSE_US: 'why-choose-us',
  NEWSLETTER: 'newsletter',
} as const;

export type SectionType = (typeof SECTION_TYPES)[keyof typeof SECTION_TYPES];

/**
 * Base configuration for a homepage section
 */
export interface HomepageSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  title?: string;
  subtitle?: string;
  theme?: SectionTheme;
  config?: Record<string, unknown>;
}

/**
 * Hero section configuration
 */
export interface HeroSectionConfig extends HomepageSection {
  type: typeof SECTION_TYPES.HERO;
  config?: {
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    height?: 'small' | 'medium' | 'large';
    theme?: string;
    backgroundColor?: string;
    bgColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
    textColor?: string;
  };
}

/**
 * Categories section configuration
 */
export interface CategoriesSectionConfig extends HomepageSection {
  type: typeof SECTION_TYPES.CATEGORIES;
  config?: {
    displayLimit?: number;
    showIcons?: boolean;
  };
}

/**
 * Product showcase section configuration
 */
export interface ProductSectionConfig extends HomepageSection {
  type:
    | typeof SECTION_TYPES.FEATURED
    | typeof SECTION_TYPES.BESTSELLERS
    | typeof SECTION_TYPES.NEW_ARRIVALS
    | typeof SECTION_TYPES.FLASH_SALE;
  config?: {
    displayLimit?: number;
    productSource?: ProductSource;
    discountThreshold?: number;
  };
}

/**
 * Promotional banner configuration
 */
export interface PromoBannerSectionConfig extends HomepageSection {
  type: typeof SECTION_TYPES.PROMO_BANNER;
  config?: {
    imageUrl?: string;
    backgroundColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
    textColor?: string;
    badgeText?: string;
    promoCode?: string;
    discountTag?: string;
    buttonText?: string;
    buttonLink?: string;
    link?: string;
  };
}

/**
 * Why choose us section configuration
 */
export interface WhyChooseUsSectionConfig extends HomepageSection {
  type: typeof SECTION_TYPES.WHY_CHOOSE_US;
  config?: {
    features?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

/**
 * Newsletter section configuration
 */
export interface NewsletterSectionConfig extends HomepageSection {
  type: typeof SECTION_TYPES.NEWSLETTER;
  config?: {
    placeholder?: string;
    buttonText?: string;
  };
}

export type AnySectionConfig =
  | HeroSectionConfig
  | CategoriesSectionConfig
  | ProductSectionConfig
  | PromoBannerSectionConfig
  | WhyChooseUsSectionConfig
  | NewsletterSectionConfig;

/**
 * Store-level configuration
 */
export interface StoreConfig {
  storeName: string;
  logo?: string;
  description?: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  ctaText: string;
  ctaLink: string;
  homepageSections: AnySectionConfig[];
}
