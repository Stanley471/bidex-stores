import { prisma } from '@/lib/prisma'
import { getCurrencyOption } from '@/lib/currency'

export interface UpdateStoreSettingsInput {
  storeName?: string
  storeDescription?: string | null
  storeTagline?: string | null
  logo?: string | null
  favicon?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  whatsapp?: string | null
  businessAddress?: string | null
  currencyCode?: string
  currencySymbol?: string
  primaryColor?: string
  secondaryColor?: string
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  twitter?: string | null
  youtube?: string | null
  isStoreActive?: boolean
  acceptOrders?: boolean
  notificationsEnabled?: boolean
  senderName?: string | null
  senderEmail?: string | null
  merchantNotificationEmail?: string | null
}

class StoreSettingsService {
  async getStoreSettings() {
    let settings = await prisma.storeSettings.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          storeName: 'CTools Store',
          storeDescription: 'Your one-stop shop for quality tools & products',
          currencyCode: 'NGN',
          currencySymbol: '₦',
          primaryColor: '#F68B1E',
          secondaryColor: '#FF6600',
          isStoreActive: true,
          acceptOrders: true,
          notificationsEnabled: true,
          senderName: 'CTools Store',
        },
      })
    }

    return {
      id: settings.id,
      storeName: settings.storeName,
      storeDescription: settings.storeDescription,
      storeTagline: settings.storeTagline,
      logo: settings.logo,
      favicon: settings.favicon,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      whatsapp: settings.whatsapp,
      businessAddress: settings.businessAddress,
      currencyCode: settings.currencyCode || 'NGN',
      currencySymbol: settings.currencySymbol || '₦',
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      instagram: settings.instagram,
      facebook: settings.facebook,
      tiktok: settings.tiktok,
      twitter: settings.twitter,
      youtube: settings.youtube,
      isStoreActive: settings.isStoreActive,
      acceptOrders: settings.acceptOrders,
      notificationsEnabled: settings.notificationsEnabled ?? true,
      senderName: settings.senderName ?? 'CTools Store',
      senderEmail: settings.senderEmail ?? null,
      merchantNotificationEmail: settings.merchantNotificationEmail ?? null,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    }
  }

  async getPublicStoreSettings() {
    const settings = await this.getStoreSettings()

    // Explicitly return ONLY non-sensitive public storefront settings
    return {
      storeName: settings.storeName,
      storeDescription: settings.storeDescription,
      storeTagline: settings.storeTagline,
      logo: settings.logo,
      favicon: settings.favicon,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      whatsapp: settings.whatsapp,
      businessAddress: settings.businessAddress,
      currencyCode: settings.currencyCode,
      currencySymbol: settings.currencySymbol,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      instagram: settings.instagram,
      facebook: settings.facebook,
      tiktok: settings.tiktok,
      twitter: settings.twitter,
      youtube: settings.youtube,
      isStoreActive: settings.isStoreActive,
      acceptOrders: settings.acceptOrders,
    }
  }

  async updateStoreSettings(input: UpdateStoreSettingsInput) {
    let existing = await prisma.storeSettings.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!existing) {
      existing = await prisma.storeSettings.create({
        data: {
          storeName: input.storeName?.trim() || 'CTools Store',
        },
      })
    }

    // Input Validation
    if (input.storeName !== undefined) {
      if (!input.storeName || input.storeName.trim().length === 0) {
        throw new Error('Store name cannot be empty.')
      }
      if (input.storeName.length > 100) {
        throw new Error('Store name must be under 100 characters.')
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (input.contactEmail !== undefined && input.contactEmail) {
      if (!emailRegex.test(input.contactEmail.trim())) {
        throw new Error('Invalid contact email format.')
      }
    }

    if (input.senderEmail !== undefined && input.senderEmail) {
      if (!emailRegex.test(input.senderEmail.trim())) {
        throw new Error('Invalid sender email format.')
      }
    }

    if (input.merchantNotificationEmail !== undefined && input.merchantNotificationEmail) {
      if (!emailRegex.test(input.merchantNotificationEmail.trim())) {
        throw new Error('Invalid merchant notification email format.')
      }
    }

    // Color Validation (Hex format)
    const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
    if (input.primaryColor !== undefined) {
      if (!hexColorRegex.test(input.primaryColor.trim())) {
        throw new Error('Primary color must be a valid hex color (e.g. #0f172a).')
      }
    }
    if (input.secondaryColor !== undefined) {
      if (!hexColorRegex.test(input.secondaryColor.trim())) {
        throw new Error('Secondary color must be a valid hex color (e.g. #10b981).')
      }
    }

    let symbol = input.currencySymbol
    if (input.currencyCode && !symbol) {
      symbol = getCurrencyOption(input.currencyCode).symbol
    }

    const updated = await prisma.storeSettings.update({
      where: { id: existing.id },
      data: {
        ...(input.storeName !== undefined ? { storeName: input.storeName.trim() } : {}),
        ...(input.storeDescription !== undefined ? { storeDescription: input.storeDescription?.trim() || null } : {}),
        ...(input.storeTagline !== undefined ? { storeTagline: input.storeTagline?.trim() || null } : {}),
        ...(input.logo !== undefined ? { logo: input.logo?.trim() || null } : {}),
        ...(input.favicon !== undefined ? { favicon: input.favicon?.trim() || null } : {}),
        ...(input.contactEmail !== undefined ? { contactEmail: input.contactEmail?.trim() || null } : {}),
        ...(input.contactPhone !== undefined ? { contactPhone: input.contactPhone?.trim() || null } : {}),
        ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp?.trim() || null } : {}),
        ...(input.businessAddress !== undefined ? { businessAddress: input.businessAddress?.trim() || null } : {}),
        ...(input.currencyCode !== undefined ? { currencyCode: input.currencyCode.trim().toUpperCase() } : {}),
        ...(input.currencySymbol !== undefined ? { currencySymbol: symbol?.trim() || '₦' } : {}),
        ...(input.primaryColor !== undefined ? { primaryColor: input.primaryColor.trim() } : {}),
        ...(input.secondaryColor !== undefined ? { secondaryColor: input.secondaryColor.trim() } : {}),
        ...(input.instagram !== undefined ? { instagram: input.instagram?.trim() || null } : {}),
        ...(input.facebook !== undefined ? { facebook: input.facebook?.trim() || null } : {}),
        ...(input.tiktok !== undefined ? { tiktok: input.tiktok?.trim() || null } : {}),
        ...(input.twitter !== undefined ? { twitter: input.twitter?.trim() || null } : {}),
        ...(input.youtube !== undefined ? { youtube: input.youtube?.trim() || null } : {}),
        ...(input.isStoreActive !== undefined ? { isStoreActive: input.isStoreActive } : {}),
        ...(input.acceptOrders !== undefined ? { acceptOrders: input.acceptOrders } : {}),
        ...(input.notificationsEnabled !== undefined ? { notificationsEnabled: input.notificationsEnabled } : {}),
        ...(input.senderName !== undefined ? { senderName: input.senderName?.trim() || null } : {}),
        ...(input.senderEmail !== undefined ? { senderEmail: input.senderEmail?.trim() || null } : {}),
        ...(input.merchantNotificationEmail !== undefined ? { merchantNotificationEmail: input.merchantNotificationEmail?.trim() || null } : {}),
      },
    })

    return this.getStoreSettings()
  }
}

export const storeSettingsService = new StoreSettingsService()
