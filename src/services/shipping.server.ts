import type { ShippingType } from '@/generated/prisma/client'
import type { ShippingConfigInput } from '@/lib/shipping/validation'
import { prisma } from '@/lib/prisma'

export interface CalculatedShipping {
  type: ShippingType
  fee: number
  isNegotiable: boolean
  label: string
}

class ShippingServerService {
  async getShippingConfig() {
    let config = await prisma.shippingConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!config) {
      config = await prisma.shippingConfig.create({
        data: {
          type: 'FLAT_RATE',
          fee: 0,
          isActive: true,
        },
      })
    }

    return {
      id: config.id,
      type: config.type,
      fee: Number(config.fee),
      isActive: config.isActive,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    }
  }

  async calculateShipping(_subtotal: number): Promise<CalculatedShipping> {
    const config = await this.getShippingConfig()

    if (config.type === 'FREE') {
      return {
        type: 'FREE',
        fee: 0,
        isNegotiable: false,
        label: 'Free Shipping',
      }
    }

    if (config.type === 'NEGOTIABLE') {
      return {
        type: 'NEGOTIABLE',
        fee: 0,
        isNegotiable: true,
        label: 'To be confirmed',
      }
    }

    // FLAT_RATE
    return {
      type: 'FLAT_RATE',
      fee: config.fee,
      isNegotiable: false,
      label: 'Flat Rate',
    }
  }

  async updateShippingConfig(input: ShippingConfigInput) {
    let feeToSave = input.fee

    if (input.type === 'FREE' || input.type === 'NEGOTIABLE') {
      feeToSave = 0
    }

    // Deactivate existing configs
    await prisma.shippingConfig.updateMany({
      data: { isActive: false },
    })

    // Create new active config
    const updated = await prisma.shippingConfig.create({
      data: {
        type: input.type,
        fee: feeToSave,
        isActive: true,
      },
    })

    return {
      id: updated.id,
      type: updated.type,
      fee: Number(updated.fee),
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  }
}

export const shippingServerService = new ShippingServerService()
