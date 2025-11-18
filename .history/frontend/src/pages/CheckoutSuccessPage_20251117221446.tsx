import { useSearchParams, Link } from 'react-router-dom'
import { Header } from '@/components/common/Header'

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')
  return (
    <main className="min-h-dvh bg-gray-50">
      <Header />
      <section className="max-w-xl mx-auto p-8">
        <div className="bg-white p-8 rounded-lg shadow text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-600">¡Compra exitosa!</h1>
          <p className="text-gray-600">Tu orden ha sido procesada correctamente.</p>
          {orderId && (
            <p className="text-sm bg-gray-100 rounded p-3">Número de orden: <span className="font-semibold">#{orderId}</span></p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link to="/account/orders" className="px-4 py-2 rounded bg-indigo-600 text-white">Ver mis órdenes</Link>
            <Link to="/" className="px-4 py-2 rounded bg-gray-200 text-gray-800">Seguir comprando</Link>
          </div>
        </div>
      </section>
    </main>
  )
}