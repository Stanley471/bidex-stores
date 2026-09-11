import { OrderHistory } from '@/components/orders/OrderHistory';

export default function OrdersPage() {
  return (
    <main className="flex-1 bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Orders</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Recent orders</h1>
        </div>
        <OrderHistory />
      </div>
    </main>
  );
}
