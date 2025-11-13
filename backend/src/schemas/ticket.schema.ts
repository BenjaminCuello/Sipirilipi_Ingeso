import { z } from 'zod';

// Enum nativo de TypeScript
enum TicketStatus {
    open = 'open',
    approved = 'approved',
    rejected = 'rejected',
    closed = 'closed',
}

/**
 * Esquema para crear un ticket
 * POST /api/tickets
 */
export const createTicketSchema = z.object({
    body: z.object({
        orderId: z.string().cuid2('El ID de la orden no es válido'),
        reason: z
            .string()
            .min(10, 'El motivo debe tener al menos 10 caracteres')
            .max(500, 'El motivo no puede exceder los 500 caracteres'),
    }),
});

/**
 * Esquema para actualizar el estado de un ticket
 * PATCH /api/tickets/:id/status
 */
export const updateTicketStatusSchema = z.object({
    body: z.object({
        // 🟢 CORRECCIÓN: Se eliminó el segundo argumento (objeto de error).
        // z.nativeEnum() ya tiene un mensaje de error por defecto.
        status: z.nativeEnum(TicketStatus),
    }),
    params: z.object({
        id: z.string().cuid2('El ID del ticket no es válido'),
    }),
});