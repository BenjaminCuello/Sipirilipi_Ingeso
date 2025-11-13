// frontend/src/pages/TicketsCustomerPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketService, createTicketSchema, type CreateTicketInput } from '../services/TicketService';
import { useToast } from '../lib/toast';
import { Link } from 'react-router-dom';

// Helper para formatear fecha
const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function TicketsCustomerPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // 1. Obtener órdenes para el <select>
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['my-orders-stubs'],
    queryFn: ticketService.getMyOrders,
  });

  // 2. Obtener tickets existentes
  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketService.listMine,
  });

  // 3. Formulario (React Hook Form + Zod)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { orderId: '', motivo: '' },
  });

  // 4. Mutación para crear el ticket
  const createTicketMutation = useMutation({
    mutationFn: ticketService.create,
    onSuccess: async () => {
      toast.push('success', 'Ticket creado exitosamente.');
      reset();
      await queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
    onError: (error: Error) => {
      toast.push('error', error.message || 'Error al crear el ticket.');
    },
  });

  const onSubmit = (data: CreateTicketInput) => {
    createTicketMutation.mutate(data);
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-6">Mis Tickets de Cambio</h1>

      {/* --- Formulario de Creación --- */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Abrir un nuevo ticket</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
              Seleccionar Orden
            </label>
            <Controller
              name="orderId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="orderId"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.orderId ? 'border-red-500' : ''}`}
                  disabled={isLoadingOrders || createTicketMutation.isPending}
                >
                  <option value="">{isLoadingOrders ? 'Cargando órdenes...' : 'Selecciona...'}</option>
                  {orders?.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.id} (Fecha: {formatDate(order.createdAt)})
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.orderId && <p className="mt-1 text-sm text-red-600">{errors.orderId.message}</p>}
          </div>
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">
              Motivo del cambio
            </label>
            <Controller
              name="motivo"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="motivo"
                  rows={4}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${errors.motivo ? 'border-red-500' : ''}`}
                  placeholder="Ej: El producto llegó dañado..."
                  disabled={createTicketMutation.isPending}
                />
              )}
            />
            {errors.motivo && <p className="mt-1 text-sm text-red-600">{errors.motivo.message}</p>}
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? 'Enviando...' : 'Enviar Ticket'}
          </button>
        </div>
      </form>

      {/* --- Listado de Tickets --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Historial de Tickets</h2>
        {isLoadingTickets ? (
          <p>Cargando historial...</p>
        ) : !tickets || tickets.length === 0 ? (
          <p className="text-gray-500">No tienes tickets abiertos.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-indigo-600">Ticket #{ticket.id}</p>
                    <p className="text-sm text-gray-700">Orden: {ticket.orderId}</p>
                    <p className="text-sm text-gray-500 mt-1">Motivo: {ticket.motivo}</p>
                  </div>
                  <span
                    // 🟢 CORRECCIÓN: Faltaba la tilde invertida (`) antes del '}'
                    className={`px-3 py-1 rounded-full text-sm font-medium
                      ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' : ''}
                      ${ticket.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      ${ticket.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      ${ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''}
                    `}
                  >
                    {ticket.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Volver al inicio</Link>
    </div>
  );
}