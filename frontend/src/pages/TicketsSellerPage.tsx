// frontend/src/pages/TicketsSellerPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// 🟢 1. CORRECCIÓN: Se eliminó 'type Ticket' de la importación
import { ticketService, type TicketStatus, ticketStatusSchema } from '../services/TicketService';
import { useToast } from '../lib/toast';
import { Link } from 'react-router-dom';

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const statusOptions = ticketStatusSchema.options;

export default function TicketsSellerPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // 1. Obtener TODOS los tickets
  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['all-tickets'],
    queryFn: ticketService.listAll,
  });

  // 2. Mutación para actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: (variables: { id: string; status: TicketStatus }) =>
      ticketService.updateStatus(variables.id, variables.status),
    // 🟢 2. CORRECCIÓN: Se añade 'async' y 'await'
    onSuccess: async (updatedTicket) => {
      toast.push('success', `Ticket ${updatedTicket.id} actualizado a ${updatedTicket.status}`);
      // Refrescamos la lista
      await queryClient.invalidateQueries({ queryKey: ['all-tickets'] });
    },
    onError: (error: Error) => {
      toast.push('error', error.message || 'Error al actualizar el ticket.');
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    // Validación de Zod
    const parsedStatus = ticketStatusSchema.safeParse(newStatus);
    if (!parsedStatus.success) {
      toast.push('error', 'Estado no válido');
      return;
    }

    // Confirmación
    if (window.confirm(`¿Seguro que quieres cambiar el estado a "${newStatus}"?`)) {
      updateStatusMutation.mutate({ id, status: parsedStatus.data });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Tickets</h1>
        <Link to="/panel/dashboard" className="text-indigo-600 hover:underline">Volver al Panel</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        {isLoadingTickets ? (
          <p className="p-6">Cargando tickets...</p>
        ) : !tickets || tickets.length === 0 ? (
          <p className="p-6 text-gray-500">No hay tickets para gestionar.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.orderId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(ticket.createdAt)}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{ticket.motivo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                        ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' : ''}
                        ${ticket.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${ticket.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        ${ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' : ''}`}
                    >
                      {ticket.status}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === ticket.id}
                    className="rounded-md border-gray-300 shadow-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}