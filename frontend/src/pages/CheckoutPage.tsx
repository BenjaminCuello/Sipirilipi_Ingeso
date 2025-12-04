import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Header } from '@/components/common/Header'
import { formatCLPFromCents } from '@/lib/format'
import { isAuthenticated } from '@/lib/auth'
import { useCartStore, selectCartItems, selectCartTotal } from '@/store/cartStore'
import OrderService from '@/services/OrderServices'

type OrderCreationResult = { orderId: number; createdAt: string; total: number }

const CHECKOUT_REDIRECT_STATE = { from: '/checkout' as const }

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const items = useCartStore(selectCartItems)
  const totalCents = useCartStore(selectCartTotal)
  const clearCart = useCartStore((state) => state.clear)

  const createOrderMutation = useMutation<OrderCreationResult, Error>({
    mutationFn: () => OrderService.create(items),
    onSuccess: (data) => {
      clearCart()
      navigate(`/checkout/success?orderId=${data.orderId}`)
    },
    onError: (error) => {
      const anyError = error as any

      if (typeof anyError.status === 'number') {
        const status = anyError.status as number
        const payload = anyError.payload as { error?: string; unavailableProducts?: number[] } | null

        // Sesion expirada o sin autorizacion
        if (status === 401 || status === 403) {
          navigate('/login', { replace: true, state: CHECKOUT_REDIRECT_STATE })
          return
        }

        // Conflicto de stock: indicar productos afectados
        if (status === 409 && Array.isArray(payload?.unavailableProducts)) {
          const ids = payload.unavailableProducts
          const names = ids.map((id) => items.find((it) => it.id === id)?.name ?? `Producto #${id}`)
          const list = names.map((n) => `- ${n}`).join('\n')
          alert(
            `No hay stock suficiente para algunos productos de tu carrito:\n\n${list}\n\n` +
              'Ajusta las cantidades en tu carrito e intenta nuevamente.'
          )
          return
        }
      }

      // Compatibilidad con mensajes antiguos
      if (error.message === 'Autorizacion requerida') {
        navigate('/login', { replace: true, state: CHECKOUT_REDIRECT_STATE })
        return
      }

      console.error('Error al crear la orden:', error)
      alert(`Error: ${error.message ?? 'No se pudo procesar el pago'}`)
    },
  })

  const handleConfirmPurchase = () => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: CHECKOUT_REDIRECT_STATE })
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
            <h2 className="text-xl">Tu carrito esta vacio.</h2>
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              Volver al catalogo
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
          <h1 className="text-2xl font-bold mb-6 text-center">Confirmar compra</h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold border-b pb-2 mb-3">Resumen de la orden</h2>
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
              <span>Total a pagar</span>
              <span>{formatCLPFromCents(totalCents)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Este es un pago simulado. Al confirmar, tu orden sera procesada inmediatamente.
          </p>

          <button
            onClick={handleConfirmPurchase}
            disabled={createOrderMutation.isPending}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-wait"
          >
            {createOrderMutation.isPending ? 'Procesando pago...' : 'Confirmar y pagar'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default CheckoutPage

