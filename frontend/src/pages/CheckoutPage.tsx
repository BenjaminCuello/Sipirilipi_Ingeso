import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Header } from '@/components/common/Header'
import { formatCLPFromCents } from '@/lib/format'
import { isAuthenticated } from '@/lib/auth'
import { useCartStore, selectCartItems, selectCartTotal } from '@/store/cartStore'
import OrderService from '@/services/OrderServices'

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const items = useCartStore(selectCartItems)
  const totalCents = useCartStore(selectCartTotal)
  const clearCart = useCartStore((state) => state.clear)

  const createOrderMutation = useMutation({
    mutationFn: () => OrderService.create(items),
    onSuccess: (data) => {
      clearCart()
      navigate(`/checkout/success?orderId=${data.orderId}`)
    },
    onError: (error: any) => {
      if (error?.message === 'Autorizacion requerida' || error?.message === 'Autorización requerida') {
        navigate('/login', { replace: true, state: { from: '/checkout' } as any })
        return
      }
      console.error('Error al crear la orden:', error)
      alert(`Error: ${error.message ?? 'No se pudo procesar el pago'}`)
    },
  })

  const handleConfirmPurchase = () => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/checkout' } as any })
      return
    }
    createOrderMutation.mutate()
  }

  const isEmpty = items.length === 0

  if (isEmpty && !createOrderMutation.isSuccess) {
    return (
      <main className="min-h-dvh bg-gray-50">
        <Header />
        <section className="max-w-2xl mx-auto p-10">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl">Tu carrito está vacío.</h2>
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              Volver al catálogo
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <Header />
      <section className="max-w-2xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Confirmar Compra</h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold border-b pb-2 mb-3">Resumen de la Orden</h2>
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span className="font-medium">
                    {formatCLPFromCents(item.price_cents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total a Pagar</span>
              <span>{formatCLPFromCents(totalCents)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Este es un pago simulado. Al confirmar, tu orden será procesada inmediatamente.
          </p>

          <button
            onClick={handleConfirmPurchase}
            disabled={createOrderMutation.isPending}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-wait"
          >
            {createOrderMutation.isPending ? 'Procesando pago...' : 'Confirmar y Pagar'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default CheckoutPage

