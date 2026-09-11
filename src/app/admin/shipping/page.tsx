import { ShippingConfigForm } from '@/components/admin/shipping/ShippingConfigForm'

export const metadata = {
  title: 'Shipping Settings | Admin Console',
}

export default function AdminShippingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Shipping Settings</h1>
        <p className="text-sm text-slate-500">
          Configure store shipping modes (Free, Flat Rate, or Negotiable) for client deployment.
        </p>
      </div>

      <ShippingConfigForm />
    </div>
  )
}
