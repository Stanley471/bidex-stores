import type { Address } from '@/generated/prisma/client'
import type { AddressInput } from '@/lib/address/validation'
import { prisma } from '@/lib/prisma'

class AddressService {
  async getUserAddresses(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  }

  async getAddress(userId: string, addressId: string): Promise<Address> {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })
    if (!address) {
      throw new Error('Address not found.')
    }
    return address
  }

  async createAddress(userId: string, input: AddressInput): Promise<Address> {
    const count = await prisma.address.count({ where: { userId } })
    const shouldBeDefault = count === 0 ? true : Boolean(input.isDefault)

    if (shouldBeDefault && count > 0) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return prisma.address.create({
      data: {
        userId,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone?.trim() || null,
        country: input.country.trim(),
        state: input.state.trim(),
        city: input.city.trim(),
        addressLine1: input.addressLine1.trim(),
        addressLine2: input.addressLine2?.trim() || null,
        postalCode: input.postalCode.trim(),
        isDefault: shouldBeDefault,
      },
    })
  }

  async updateAddress(userId: string, addressId: string, input: AddressInput): Promise<Address> {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!existing) {
      throw new Error('Address not found.')
    }

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      })
    }

    return prisma.address.update({
      where: { id: addressId },
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone?.trim() || null,
        country: input.country.trim(),
        state: input.state.trim(),
        city: input.city.trim(),
        addressLine1: input.addressLine1.trim(),
        addressLine2: input.addressLine2?.trim() || null,
        postalCode: input.postalCode.trim(),
        isDefault: input.isDefault,
      },
    })
  }

  async deleteAddress(userId: string, addressId: string): Promise<Address> {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!existing) {
      throw new Error('Address not found.')
    }

    const deleted = await prisma.address.delete({
      where: { id: addressId },
    })

    if (deleted.isDefault) {
      const firstRemaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      if (firstRemaining) {
        await prisma.address.update({
          where: { id: firstRemaining.id },
          data: { isDefault: true },
        })
      }
    }

    return deleted
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!existing) {
      throw new Error('Address not found.')
    }

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    })

    return prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    })
  }
}

export const addressService = new AddressService()
