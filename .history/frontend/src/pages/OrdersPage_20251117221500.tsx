import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import OrderService, { type Order } from '@/services/OrderService'
import { formatCLPFromCents } from '@/lib/format'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Orden #{order.id}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <ul className="divide-y divide-gray-200 mb-4">
          {order.items.map(it => (
            <li key={it.productId} className="py-3 flex justify-between">
              <div>
                <p className="font-medium">Producto #{it.productId}</p>
                <p className="text-xs text-gray-500">Cantidad: {it.quantity}</p>
              </div>
              <span className="font-medium">{formatCLPFromCents(it.subtotal_cents)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-4 text-right font-semibold">Total: {formatCLPFromCents(order.total_cents)}</div>
        <button onClick={onClose} className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded">Cerrar</button>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useQuery({ queryKey: ['orders'], queryFn: () => OrderService.listMine() })
  const [selected, setSelected] = useState<Order | null>(null)

  if (isLoading) return <div className="p-6">Cargando órdenes...</div>
  if (isError) return <div className="p-6 text-red-600">Error al cargar órdenes.</div>

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Mis Órdenes</h1>
      {orders.length === 0 ? (
        <div className="bg-white rounded shadow p-8 text-center">Aún no tienes órdenes.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">#{o.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{format(new Date(o.createdAt), 'dd MMM yyyy', { locale: es })}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCLPFromCents(o.total_cents)}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{o.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => setSelected(o)} className="text-indigo-600 hover:text-indigo-800 font-medium">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}