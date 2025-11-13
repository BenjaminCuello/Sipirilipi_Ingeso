import { Router } from 'express';
// 🟢 1. Importamos AuthPayload y la ruta de 'validate' es correcta
import { requireAuth, requireRole, type AuthPayload } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createTicketSchema,
    updateTicketStatusSchema,
} from '../schemas/ticket.schema';
import { ticketService } from '../services/ticket.service';

const router = Router();

// Todas las rutas de tickets requieren autenticación
router.use(requireAuth);

/**
 * (Cliente) POST /api/tickets
 * Crear un nuevo ticket de cambio
 */
router.post('/', validate(createTicketSchema), async (req, res, next) => {
    try {
        const { orderId, reason } = req.body;
        // 🟢 2. CORRECCIÓN: Leemos de 'res.locals.user.sub'
        const userId = (res.locals.user as AuthPayload).sub;

        const ticket = await ticketService.createTicket({
            orderId,
            reason,
            userId,
        });

        res.status(201).json(ticket);
    } catch (error) {
        next(error);
    }
});

/**
 * (Cliente) GET /api/tickets/mine
 * Ver mis tickets
 */
router.get('/mine', async (req, res, next) => {
    try {
        // 🟢 3. CORRECCIÓN: Leemos de 'res.locals.user.sub'
        const userId = (res.locals.user as AuthPayload).sub;
        const tickets = await ticketService.listMine(userId);
        res.json(tickets);
    } catch (error) {
        next(error);
    }
});

// ---------------------------------------------------
// Rutas de Vendedor / Admin
// ---------------------------------------------------

/**
 * (Vendedor/Admin) GET /api/tickets
 * Ver todos los tickets
 */
router.get('/', requireRole('ADMIN', 'SELLER'), async (req, res, next) => {
    try {
        const tickets = await ticketService.listAll();
        res.json(tickets);
    } catch (error) {
        next(error);
    }
});

/**
 * (Vendedor/Admin) PATCH /api/tickets/:id/status
 * Actualizar el estado de un ticket
 */
router.patch(
    '/:id/status',
    requireRole('ADMIN', 'SELLER'),
    validate(updateTicketStatusSchema),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const updatedTicket = await ticketService.updateStatus(id, status);
            res.json(updatedTicket);
        } catch (error) {
            next(error);
        }
    }
);

export default router;