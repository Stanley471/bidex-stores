'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Address } from '@/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface AddressSelectorProps {
  selectedAddressId: string | null
  onSelectAddress: (addressId: string) => void
}

export function AddressSelector({ selectedAddressId, onSelectAddress }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New address form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('United States')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/addresses')
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load addresses')
      }
      setAddresses(data.addresses)
      if (data.addresses.length > 0 && !selectedAddressId) {
        const defaultAddr = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0]
        onSelectAddress(defaultAddr.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load addresses.')
    } finally {
      setLoading(false)
    }
  }, [onSelectAddress, selectedAddressId])

  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const res = await fetch('/api/addresses')
        const data = await res.json()
        if (!ignore) {
          if (res.ok && data.success) {
            setAddresses(data.addresses)
            if (data.addresses.length > 0 && !selectedAddressId) {
              const defaultAddr = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0]
              onSelectAddress(defaultAddr.id)
            }
          } else {
            setError(data.message || 'Failed to load addresses')
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unable to load addresses.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [onSelectAddress, selectedAddressId])

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          country: country.trim(),
          state: state.trim(),
          city: city.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          postalCode: postalCode.trim(),
          isDefault: addresses.length === 0,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add address')
      }

      setIsFormOpen(false)
      onSelectAddress(data.address.id)
      fetchAddresses()

      // Reset form
      setFirstName('')
      setLastName('')
      setPhone('')
      setAddressLine1('')
      setAddressLine2('')
      setCity('')
      setState('')
      setPostalCode('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to save address.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Shipping Address</h3>
        <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
          + Add New Address
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 space-y-3">
          <p>You do not have any saved shipping addresses.</p>
          <Button onClick={() => setIsFormOpen(true)}>Create Address</Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id
            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr.id)}
                className={`relative rounded-xl border p-4 cursor-pointer transition space-y-1 ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">
                    {addr.firstName} {addr.lastName}
                  </span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-xs text-slate-600">{addr.addressLine2}</p>}
                <p className="text-xs text-slate-600">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="text-xs font-semibold text-slate-500">{addr.country}</p>
                {addr.phone && (
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{addr.phone}</span>
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Address Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Add New Shipping Address</h3>

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Street address or P.O. Box"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt, Suite, Unit, Building"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
