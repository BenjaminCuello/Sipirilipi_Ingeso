import { prisma } from '../lib/prisma';
// 🟢 1. CORRECCIÓN: Se eliminó la importación de 'AppError'

// Definimos el tipo manualmente
type TicketStatus = 'open' | 'approved' | 'rejected' | 'closed';

// 10 días en milisegundos
const TICKET_WINDOW_MS = 10 * 24 * 60 * 60 * 1000;

/**
 * (Cliente) Crea un nuevo ticket de cambio
 * Valida la propiedad de la orden y la ventana de 10 días.
 */
async function createTicket(input: {
    orderId: string;
    reason: string;
    userId: number;
}) {
    const { orderId, reason, userId } = input;

    // 1. Verificar que la orden existe y pertenece al usuario
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        // 🟢 2. CORRECCIÓN: Lanzamos un error estándar con 'status'
        throw Object.assign(new Error('Orden no encontrada'), { status: 404 });
    }

    if (order.userId !== userId) {
        throw Object.assign(new Error('No tienes permiso para esta orden'), { status: 403 });
    }

    // 2. Validar la ventana de 10 días
    const orderDate = order.createdAt;
    const now = new Date();

    if (now.getTime() - orderDate.getTime() > TICKET_WINDOW_MS) {
        throw Object.assign(
            new Error('La ventana de 10 días para crear un ticket ha expirado'),
            { status: 400, code: 'WINDOW_EXCEEDED' }
        );
    }

    // 3. Crear el ticket
    // 🟢 3. CORRECCIÓN (Aviso de "redundant"): Retornamos directamente
    return prisma.returnTicket.create({
        data: {
            reason,
            orderId,
            userId,
            status: 'open',
        },
    });
}

/**
 * (Cliente) Lista los tickets del usuario logueado
 */
async function listMine(userId: number) {
    return prisma.returnTicket.findMany({
        where: { userId },
        orderBy: { openedAt: 'desc' },
    });
}

/**
 * (Vendedor/Admin) Lista todos los tickets
 */
async function listAll() {
    return prisma.returnTicket.findMany({
        orderBy: { openedAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
}

/**
 * (Vendedor/Admin) Actualiza el estado de un ticket
 */
async function updateStatus(ticketId: string, status: TicketStatus) {
    // Verificamos que el ticket exista antes de actualizar
    const ticket = await prisma.returnTicket.findUnique({
        where: { id: ticketId },
    });

    if (!ticket) {
        throw Object.assign(new Error('Ticket no encontrado'), { status: 404 });
    }

    return prisma.returnTicket.update({
        where: { id: ticketId },
        data: { status },
    });
}

export const ticketService = {
    createTicket,
    listMine,
    listAll,
    updateStatus,
};