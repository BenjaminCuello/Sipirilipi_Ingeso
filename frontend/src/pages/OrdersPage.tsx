import React, { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Header } from '@/components/common/Header'
import { formatCLPFromCents } from '@/lib/format'
import OrderService, { type Order, type OrderStatus } from '@/services/OrderServices'
import TicketService, { type CreateTicketPayload } from '@/services/TicketService'
import { getUser } from '@/lib/auth'

const TICKET_WINDOW_MS = 10 * 24 * 60 * 60 * 1000
const ALLOWED_TICKET_STATUSES: OrderStatus[] = ['paid', 'shipped', 'delivered']

const ticketDeadline = (order: Order) =>
  new Date(new Date(order.createdAt).getTime() + TICKET_WINDOW_MS)

const canRequestTicket = (order: Order) => {
  if (!ALLOWED_TICKET_STATUSES.includes(order.status)) return false
  return Date.now() <= ticketDeadline(order).getTime()
}

const makeItemKey = (orderId: number, item: Order['items'][number], index: number) =>
  `${orderId}-${item.orderItemId ?? `p${item.productId}-${index}`}`

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
            <li key={item.orderItemId} className="py-3 flex justify-between items-center">
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

type TicketItemEntry = {
  key: string
  orderItemId?: number
  quantity: number
  max: number
  selected: boolean
}

type TicketItemState = Record<string, TicketItemEntry>

const buildInitialItemState = (order: Order): TicketItemState => {
  return order.items.reduce<TicketItemState>((acc, item, index) => {
    const key = makeItemKey(order.id, item, index)
    acc[key] = {
      key,
      orderItemId: item.orderItemId,
      quantity: 1,
      max: item.quantity,
      selected: false,
    }
    return acc
  }, {})
}

const RequestTicketModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const [reason, setReason] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState(getUser()?.email ?? '')
  const [contactPhone, setContactPhone] = useState('')
  const [itemState, setItemState] = useState<TicketItemState>(() => buildInitialItemState(order))
  const [formError, setFormError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setReason('')
    setContactName('')
    setContactEmail(getUser()?.email ?? '')
    setContactPhone('')
    setItemState(buildInitialItemState(order))
    setFormError(null)
    setFeedback(null)
  }, [order.id])

  const mutation = useMutation({
    mutationFn: (payload: CreateTicketPayload) => TicketService.create(payload),
  })

  const handleQuantityChange = (key: string, value: number) => {
    setItemState((prev) => {
      const entry = prev[key]
      if (!entry) return prev
      const qty = Math.max(1, Math.min(entry.max, Number.isNaN(value) ? 1 : value))
      return {
        ...prev,
        [key]: { ...entry, quantity: qty },
      }
    })
  }

  const toggleSelection = (key: string) => {
    setItemState((prev) => {
      const entry = prev[key]
      if (!entry) return prev
      return {
        ...prev,
        [key]: { ...entry, selected: !entry.selected },
      }
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const selectedEntries = Object.values(itemState).filter((item) => item.selected)

    if (selectedEntries.length === 0) {
      setFormError('Selecciona al menos un producto para el ticket.')
      return
    }

    const invalidEntry = selectedEntries.find((entry) => typeof entry.orderItemId !== 'number')
    if (invalidEntry) {
      setFormError('No pudimos identificar los productos seleccionados. Refresca la página e intentalo nuevamente.')
      return
    }

    const selectedItems = selectedEntries.map((item) => ({
      orderItemId: item.orderItemId as number,
      quantity: item.quantity,
    }))
    if (reason.trim().length < 10) {
      setFormError('Describe el motivo del cambio con al menos 10 caracteres.')
      return
    }
    if (!contactName.trim() || !contactEmail.trim()) {
      setFormError('Completa el nombre y correo de contacto.')
      return
    }

    const payload: CreateTicketPayload = {
      orderId: order.id,
      reason: reason.trim(),
      contact: {
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim() || undefined,
      },
      items: selectedItems,
    }

    mutation.mutate(payload, {
      onSuccess: () => {
        setFeedback('Ticket enviado correctamente. Te contactaremos pronto.')
        setTimeout(() => onClose(), 1200)
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'No se pudo crear el ticket.'
        setFormError(message)
      },
    })
  }

  const deadline = ticketDeadline(order)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl animate-fade-in-up">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-2">Solicitar ticket para la orden #{order.id}</h3>
            <p className="text-sm text-gray-600">
              Vigente hasta {deadline.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo del cambio</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe lo ocurrido con el pedido"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de contacto</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ej: Ana Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="ana@correo.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
              <input
                type="tel"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="56912345678"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Productos incluidos</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {order.items.map((item, index) => {
                const key = makeItemKey(order.id, item, index)
                const entry = itemState[key]
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 border rounded-lg p-3"
                  >
                    <label className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={entry?.selected ?? false}
                        onChange={() => toggleSelection(key)}
                      />
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          Cantidad comprada: {item.quantity} · Precio unidad {formatCLPFromCents(item.price)}
                        </p>
                      </div>
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Unidades</label>
                      <input
                        type="number"
                        min={1}
                        max={item.quantity}
                        disabled={!entry?.selected}
                        value={entry?.quantity ?? 1}
                        onChange={(e) => handleQuantityChange(key, Number(e.target.value))}
                        className="w-20 rounded border border-gray-300 p-1 text-right disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
          {feedback && <p className="text-sm text-green-600">{feedback}</p>}

          <div className="flex flex-col gap-2 md:flex-row md:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {mutation.isPending ? 'Enviando...' : 'Enviar ticket'}
            </button>
          </div>
        </form>
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
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null)

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
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          Ver Detalle
                        </button>
                        <button
                          onClick={() => setTicketOrder(order)}
                          disabled={!canRequestTicket(order)}
                          className="text-sm font-medium text-emerald-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                          title={
                            canRequestTicket(order)
                              ? 'Inicia un ticket de cambio o devolucion'
                              : 'Disponible solo para órdenes pagadas dentro de los últimos 10 días'
                          }
                        >
                          Solicitar ticket
                        </button>
                      </div>
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
        {ticketOrder && <RequestTicketModal order={ticketOrder} onClose={() => setTicketOrder(null)} />}
      </section>
    </main>
  )
}

export default OrdersPage
