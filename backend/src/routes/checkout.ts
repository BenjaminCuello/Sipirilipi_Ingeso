import { Router, Request } from 'express';
import { requireAuth } from '../middleware/auth';
import { checkoutSchema, normalizeCartItems } from '../schemas/checkout.schema';
import { processCheckout, StockConflictError } from '../services/checkout.service';

// Extiende la interfaz Request para incluir 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const router = Router();

router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    // 1. Validar el payload con Zod
    const validationResult = checkoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Payload inválido', details: validationResult.error.issues });
    }

    // 2. Normalizar y agrupar items
    const normalizedItems = normalizeCartItems(validationResult.data.items);
    
    // El ID de usuario viene del middleware `requireAuth`
    const userId = Number(req.user!.id);

    // 3. Llamar al servicio transaccional
    const order = await processCheckout(userId, normalizedItems);

    // 4. Enviar respuesta exitosa
    res.status(201).json({
      orderId: order.id,
      status: order.status,
      total_cents: order.total,
    });

  } catch (error) {
    // Manejo de error específico para conflicto de stock
    if (error instanceof StockConflictError) {
      return res.status(409).json({ 
        error: 'Conflicto de stock', 
        message: error.message,
        unavailableProducts: error.unavailableProducts 
      });
    }
    // Pasar otros errores al manejador general
    next(error);
  }
});

export default router;