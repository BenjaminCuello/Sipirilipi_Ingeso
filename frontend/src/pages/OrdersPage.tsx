import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/common/Header'
import { formatCLPFromCents } from '@/lib/format'
import OrderService, { type Order, type OrderStatus } from '@/services/OrderServices'

const OrderDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold mb-4">Detalle de la Orden #{order.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>

        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li key={item.productId} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
              </div>
              <span className="font-medium">
                {formatCLPFromCents(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t text-right">
          <p className="font-semibold text-lg">
            Total: <span className="text-indigo-600">{formatCLPFromCents(order.total)}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const statusStyles: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  const statusText: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagada',
    shipped: 'Enviada',
    delivered: 'Entregada',
    cancelled: 'Cancelada',
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
      {statusText[status]}
    </span>
  )
}

const OrdersPage: React.FC = () => {
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => OrderService.listMine(),
  })

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-gray-50">
        <Header />
        <section className="max-w-5xl mx-auto p-6 text-center">Cargando historial de órdenes...</section>
      </main>
    )
  }

  if (isError) {
    return (
      <main className="min-h-dvh bg-gray-50">
        <Header />
        <section className="max-w-5xl mx-auto p-6 text-center text-red-600">
          Ocurrió un error al cargar tus órdenes.
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <Header />
      <section className="max-w-5xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Mi Historial de Órdenes</h1>
        {orders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p>Aún no has realizado ninguna compra.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    # Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatCLPFromCents(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </section>
    </main>
  )
}

export default OrdersPage
