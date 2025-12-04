import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Header } from '@/components/common/Header'

const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <main className="min-h-dvh bg-gray-50">
      <Header />
      <section className="max-w-2xl mx-auto text-center p-10">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <svg
            className="w-16 h-16 mx-auto text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold mt-4">Gracias por tu compra!</h1>
          <p className="text-gray-600 mt-2">Tu orden ha sido procesada exitosamente.</p>

          {orderId && (
            <p className="mt-4 bg-gray-100 p-3 rounded-md">
              Tu numero de orden es: <strong className="text-indigo-600">#{orderId}</strong>
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/account/orders"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius-lg)] bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              Ver mis ordenes
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius-lg)] border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default CheckoutSuccessPage

