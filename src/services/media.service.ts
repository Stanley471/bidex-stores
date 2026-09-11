import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { v2 as cloudinary } from 'cloudinary'

export const MAX_MEDIA_SIZE = 5 * 1024 * 1024 // 5MB limit
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

// Configure Cloudinary from env vars (server-side only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface UploadMediaInput {
  fileBuffer: Buffer
  originalName: string
  mimeType: string
  altText?: string
}

export interface ListMediaParams {
  page?: number
  limit?: number
  search?: string
}

/**
 * Upload a buffer to Cloudinary using upload_stream.
 * Returns the Cloudinary upload result.
 */
function uploadToCloudinary(
  buffer: Buffer,
  options: { folder: string; public_id: string; resource_type: 'image' | 'raw' | 'auto' },
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error('Cloudinary upload returned no result.'))
      } else {
        resolve({ secure_url: result.secure_url, public_id: result.public_id })
      }
    })
    stream.end(buffer)
  })
}

class MediaService {
  async uploadMedia(input: UploadMediaInput) {
    const { fileBuffer, originalName, mimeType, altText } = input

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(
        `Unsupported file type '${mimeType}'. Allowed formats: JPEG, PNG, WEBP, GIF, SVG.`,
      )
    }

    if (fileBuffer.length > MAX_MEDIA_SIZE) {
      throw new Error(
        `File size (${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB) exceeds maximum limit of 5MB.`,
      )
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error(
        'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.',
      )
    }

    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileExt = sanitizedName.split('.').pop() || 'jpg'
    const uniqueId = randomUUID()
    const publicId = `ctools-media/${uniqueId}`

    const { secure_url, public_id } = await uploadToCloudinary(fileBuffer, {
      folder: 'ctools-media',
      public_id: uniqueId,
      resource_type: 'image',
    })

    const media = await prisma.media.create({
      data: {
        filename: `${uniqueId}.${fileExt}`,
        originalName,
        mimeType,
        size: fileBuffer.length,
        storagePath: public_id, // Cloudinary public_id — used for deletion
        publicUrl: secure_url,  // Cloudinary secure CDN URL
        altText: altText?.trim() || null,
      },
    })

    return media
  }

  async listMedia(params: ListMediaParams = {}) {
    const page = Math.max(1, params.page || 1)
    const limit = Math.max(1, Math.min(100, params.limit || 24))
    const skip = (page - 1) * limit

    const where = params.search?.trim()
      ? {
          OR: [
            { originalName: { contains: params.search.trim(), mode: 'insensitive' as const } },
            { altText: { contains: params.search.trim(), mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ])

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    }
  }

  async getMediaById(id: string) {
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) throw new Error('Media asset not found.')
    return media
  }

  async updateMediaMetadata(id: string, altText?: string | null) {
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) throw new Error('Media asset not found.')

    const updated = await prisma.media.update({
      where: { id },
      data: {
        altText: altText !== undefined ? altText?.trim() || null : media.altText,
      },
    })

    return updated
  }

  async isMediaReferenced(mediaUrl: string): Promise<boolean> {
    // 1. Check ProductImage table
    const productImgCount = await prisma.productImage.count({
      where: { url: mediaUrl },
    })
    if (productImgCount > 0) return true

    // 2. Check StoreSettings (logo/favicon)
    const storeSettingsCount = await prisma.storeSettings.count({
      where: {
        OR: [{ logo: mediaUrl }, { favicon: mediaUrl }],
      },
    })
    if (storeSettingsCount > 0) return true

    // 3. Check HomepageSection configs
    const sections = await prisma.homepageSection.findMany()
    const isUsedInHomepage = sections.some((sec) => {
      const jsonString = JSON.stringify(sec.config || {})
      return jsonString.includes(mediaUrl)
    })

    return isUsedInHomepage
  }

  async deleteMedia(id: string) {
    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) throw new Error('Media asset not found.')

    // Reference check
    const referenced = await this.isMediaReferenced(media.publicUrl)
    if (referenced) {
      throw new Error('This image is currently in use and cannot be deleted.')
    }

    // Delete from Cloudinary (storagePath holds the public_id)
    try {
      await cloudinary.uploader.destroy(media.storagePath)
    } catch {
      // Log but don't block — record will still be removed from DB
    }

    // Delete record from database
    await prisma.media.delete({ where: { id } })
  }
}

export const mediaService = new MediaService()
