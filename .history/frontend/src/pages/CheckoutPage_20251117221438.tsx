import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useMutation } from '@tanstack/react-query'
import OrderService from '@/services/OrderService'
import { formatCLPFromCents } from '@/lib/format'
import { Header } from '@/components/common/Header'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clear)
  const totalCents = items.reduce((acc, it) => acc + it.price_cents * it.quantity, 0)

  const mutation = useMutation({
    mutationFn: () => OrderService.checkout(items.map(i => ({ productId: i.id, quantity: i.quantity }))),
    onSuccess: data => {
      clearCart()
      navigate(`/checkout/success?orderId=${data.id}`)
    },
  })

  if (items.length === 0) {
    return (
      <main className="min-h-dvh grid place-items-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold">Tu carrito está vacío</h1>
          <button onClick={() => navigate('/')} className="px-4 py-2 rounded bg-indigo-600 text-white">Volver al catálogo</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <Header />
      <section className="max-w-2xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6 text-center">Confirmar Compra</h1>
          <ul className="divide-y divide-gray-200 mb-6">
            {items.map(it => (
              <li key={it.id} className="py-3 flex justify-between">
                <span>{it.name} (x{it.quantity})</span>
                <span className="font-medium">{formatCLPFromCents(it.price_cents * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-lg font-semibold border-t pt-4">
            <span>Total</span>
            <span>{formatCLPFromCents(totalCents)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">Pago simulado: la orden se marcará como pagada inmediatamente.</p>
          <button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded disabled:opacity-50"
          >
            {mutation.isPending ? 'Procesando...' : 'Confirmar y Pagar'}
          </button>
        </div>
      </section>
    </main>
  )
}