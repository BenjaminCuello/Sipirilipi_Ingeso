// frontend/src/services/TicketService.ts
import { z } from 'zod';

// --- 1. Definición de Tipos ---

export const ticketStatusSchema = z.enum([
  'open',
  'approved',
  'rejected',
  'closed',
]);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  customerName: z.string(), // (Mock) Asumimos que el backend nos da esto
  status: ticketStatusSchema,
  motivo: z.string(),
  createdAt: z.string().datetime(),
});
export type Ticket = z.infer<typeof ticketSchema>;

// Este es el tipo de dato que el formulario de cliente enviará
export const createTicketSchema = z.object({
  orderId: z.string().min(1, 'Debes seleccionar una orden'),
  motivo: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

// Usamos 'Stub' (un trozo) para las órdenes que verá el cliente
export type OrderStub = {
  id: string;
  createdAt: string; // ISO string
  total: number;
};

// --- 2. Mock Data (Simulando la Base de Datos) ---

// (Usamos new Date() para que la validación de 10 días sea realista)
const today = new Date();
const fiveDaysAgo = new Date(today);
fiveDaysAgo.setDate(today.getDate() - 5);
const fifteenDaysAgo = new Date(today);
fifteenDaysAgo.setDate(today.getDate() - 15);

const MOCK_ORDERS: OrderStub[] = [
  { id: 'ORD-123', createdAt: fiveDaysAgo.toISOString(), total: 85000 },
  { id: 'ORD-456', createdAt: fifteenDaysAgo.toISOString(), total: 120000 },
];

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TKT-001',
    orderId: 'ORD-456',
    customerName: 'Cliente Demo',
    status: 'closed',
    motivo: 'El producto (viejo) llegó con un defecto en la carcasa.',
    createdAt: new Date().toISOString(),
  },
];

// Función helper para simular delay de API
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// --- 3. Mock Service (La API Falsa) ---

export const ticketService = {
  /**
   * (Cliente) Obtiene las órdenes elegibles para crear un ticket.
   */
  getMyOrders: async (): Promise<OrderStub[]> => {
    await wait(400);
    return MOCK_ORDERS;
  },

  /**
   * (Cliente) Crea un nuevo ticket de cambio.
   * Valida la ventana de 10 días.
   */
  create: async (input: CreateTicketInput): Promise<Ticket> => {
    await wait(800);
    const order = MOCK_ORDERS.find((o) => o.id === input.orderId);
    if (!order) {
      throw new Error('La orden seleccionada no existe.');
    }

    // Validación de 10 días
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 10) {
      throw new Error('La orden es muy antigua (límite 10 días) para crear un ticket.');
    }

    // Éxito
    const newTicket: Ticket = {
      id: `TKT-00${MOCK_TICKETS.length + 1}`,
      orderId: input.orderId,
      motivo: input.motivo,
      status: 'open',
      customerName: 'Cliente Demo (Mock)',
      createdAt: new Date().toISOString(),
    };
    MOCK_TICKETS.push(newTicket);
    return newTicket;
  },

  /**
   * (Cliente) Lista solo los tickets del cliente actual.
   */
  listMine: async (): Promise<Ticket[]> => {
    await wait(600);
    return MOCK_TICKETS.filter((t) => t.customerName.includes('Cliente Demo'));
  },

  /**
   * (Vendedor) Lista TODOS los tickets.
   */
  listAll: async (): Promise<Ticket[]> => {
    await wait(600);
    return MOCK_TICKETS;
  },

  /**
   * (Vendedor) Actualiza el estado de un ticket.
   */
  updateStatus: async (id: string, status: TicketStatus): Promise<Ticket> => {
    await wait(500);
    const ticket = MOCK_TICKETS.find((t) => t.id === id);
    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }
    ticket.status = status;
    return ticket;
  },
};