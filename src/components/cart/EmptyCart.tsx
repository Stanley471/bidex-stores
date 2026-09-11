import { ShoppingCart } from 'lucide-react'

export function EmptyCart() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <ShoppingCart className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">Your cart is empty</h3>
      <p className="mt-2 text-sm text-slate-600">Add a product to start building your order.</p>
    </div>
  )
}
