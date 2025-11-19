import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/common/Header'
import TicketService, {
  type TicketResponse,
  type TicketStatus,
  type TicketFilters,
} from '@/services/TicketService'

const statusLabels: Record<TicketStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  closed: 'Cerrado',
}

const statusStyles: Record<TicketStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  closed: 'bg-gray-200 text-gray-700',
}

type FilterState = {
  status: 'all' | TicketStatus
  customerEmail: string
  orderId: string
  from: string
  to: string
}

const defaultFilterState: FilterState = {
  status: 'pending',
  customerEmail: '',
  orderId: '',
  from: '',
  to: '',
}

const cleanFilters = (filters: FilterState): TicketFilters => {
  const output: TicketFilters = {}
  if (filters.status !== 'all') {
    output.status = filters.status
  }
  if (filters.customerEmail.trim()) {
    output.customerEmail = filters.customerEmail.trim()
  }
  if (filters.orderId.trim()) {
    const parsed = Number(filters.orderId)
    if (Number.isFinite(parsed)) {
      output.orderId = parsed
    }
  }
  if (filters.from) output.from = filters.from
  if (filters.to) output.to = filters.to
  return output
}

const TicketsAdminPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilterState)
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null)
  const queryClient = useQueryClient()

  const queryKey = useMemo(() => ['tickets-admin', appliedFilters], [appliedFilters])

  const { data: tickets = [], isLoading, isError, error } = useQuery<TicketResponse[], Error>({
    queryKey,
    queryFn: () => TicketService.list(cleanFilters(appliedFilters)),
    staleTime: 1000 * 15,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: TicketStatus; notes?: string }) =>
      TicketService.updateStatus(id, { status, notes }),
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: ['tickets-admin'] })
      setSelectedTicket(ticket)
    },
  })

  const submitFilters = (event: FormEvent) => {
    event.preventDefault()
    setAppliedFilters(filters)
  }

  const resetFilters = () => {
    setFilters(defaultFilterState)
    setAppliedFilters(defaultFilterState)
  }

  const openTicket = (ticket: TicketResponse) => {
    setSelectedTicket(ticket)
  }

  const closeModal = () => {
    setSelectedTicket(null)
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <Header />
      <section className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Gestión de tickets</h1>
          <p className="text-sm text-gray-600">
            Revisa solicitudes de cambio recientes, prioriza las que están por vencer y actualiza su estado.
          </p>
        </div>

        <form
          onSubmit={submitFilters}
          className="grid gap-4 md:grid-cols-[repeat(4,minmax(0,1fr))] bg-white p-4 rounded-xl shadow"
        >
          <label className="text-sm font-medium text-gray-700">
            Estado
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value as FilterState['status'] }))
              }
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
              <option value="closed">Cerrados</option>
            </select>
          </label>

          <label className="text-sm font-medium text-gray-700">
            Correo cliente
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              value={filters.customerEmail}
              onChange={(event) => setFilters((prev) => ({ ...prev, customerEmail: event.target.value }))}
              placeholder="cliente@correo.com"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            ID de orden
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              value={filters.orderId}
              onChange={(event) => setFilters((prev) => ({ ...prev, orderId: event.target.value }))}
              placeholder="123"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Desde
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Hasta
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
            />
          </label>

          <div className="flex items-end gap-2 md:col-span-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {tickets.length} ticket{tickets.length === 1 ? '' : 's'} encontrados
            </p>
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-800"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['tickets-admin'] })}
            >
              Refrescar
            </button>
          </div>

          {isLoading && <p className="p-6 text-center text-gray-500">Cargando tickets...</p>}
          {isError && (
            <p className="p-6 text-center text-red-600">
              Error al cargar tickets: {error?.message ?? 'intenta nuevamente'}
            </p>
          )}
          {!isLoading && !isError && tickets.length === 0 && (
            <p className="p-6 text-center text-gray-500">No hay tickets con los filtros actuales.</p>
          )}

          {!isLoading && !isError && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                    <th className="px-6 py-3">Código</th>
                    <th className="px-6 py-3">Orden</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Creado</th>
                    <th className="px-6 py-3">Expira</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-6 py-4 font-semibold text-gray-900">{ticket.code}</td>
                      <td className="px-6 py-4 text-gray-700">#{ticket.orderId}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{ticket.order.customer?.name ?? 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">{ticket.order.customer?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[ticket.status]}`}>
                          {statusLabels[ticket.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(ticket.createdAt).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(ticket.expiresAt).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openTicket(ticket)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={closeModal}
            onSave={updateStatus.mutate}
            loading={updateStatus.isPending}
          />
        )}
      </section>
    </main>
  )
}

const TicketDetailModal: React.FC<{
  ticket: TicketResponse
  loading: boolean
  onClose: () => void
  onSave: (variables: { id: number; status: TicketStatus; notes?: string }) => void
}> = ({ ticket, onClose, onSave, loading }) => {
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const [notes, setNotes] = useState(ticket.notes ?? '')

  useEffect(() => {
    setStatus(ticket.status)
    setNotes(ticket.notes ?? '')
  }, [ticket])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSave({ id: ticket.id, status, notes: notes.trim() || undefined })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs uppercase text-gray-500">Ticket</p>
            <h2 className="text-2xl font-semibold">{ticket.code}</h2>
            <p className="text-sm text-gray-500">Orden #{ticket.orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
          <div className="space-y-4">
            <section className="rounded-xl border p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Motivo y contacto</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{ticket.reason}</p>
              <div className="mt-4 text-sm text-gray-600">
                <p>Nombre: {ticket.contact.name}</p>
                <p>Correo: {ticket.contact.email}</p>
                {ticket.contact.phone && <p>Teléfono: {ticket.contact.phone}</p>}
              </div>
            </section>

            <section className="rounded-xl border p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Artículos</h3>
              <ul className="divide-y text-sm text-gray-700">
                {ticket.items.map((item) => (
                  <li key={item.orderItemId} className="py-2 flex justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-500">ID item #{item.orderItemId}</p>
                    </div>
                    <span className="font-semibold">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <form className="rounded-xl border p-4 space-y-3" onSubmit={handleSubmit}>
            <h3 className="font-semibold text-gray-800">Actualizar estado</h3>
            <label className="text-sm font-medium text-gray-700">
              Estado
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                value={status}
                onChange={(event) => setStatus(event.target.value as TicketStatus)}
              >
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
                <option value="closed">Cerrado</option>
              </select>
            </label>

            <label className="text-sm font-medium text-gray-700">
              Notas internas (opcional)
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Agrega contexto para el equipo o seguimiento"
              />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        <div className="border-t px-6 py-4 text-sm text-gray-500 flex justify-between flex-wrap gap-2">
          <span>Creado: {new Date(ticket.createdAt).toLocaleString('es-CL')}</span>
          <span>Expira: {new Date(ticket.expiresAt).toLocaleString('es-CL')}</span>
          <span>Última actualización: {new Date(ticket.updatedAt).toLocaleString('es-CL')}</span>
        </div>
      </div>
    </div>
  )
}

export default TicketsAdminPage
