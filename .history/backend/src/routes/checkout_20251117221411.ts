import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { checkoutSchema, normalizeCartItems } from '../schemas/checkout.schema'
import { processCheckout, StockConflictError } from '../services/checkout.service'

const router = Router()

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.issues })
    }
    const user = res.locals.user
    const items = normalizeCartItems(parsed.data.items)
    const order = await processCheckout(user.sub, items)
    res.status(201).json({
      id: order.id,
      status: order.status,
      total_cents: order.total_cents,
      createdAt: order.createdAt,
      items: order.items.map(i => ({
        productId: i.productId,
        quantity: i.qty,
        unit_price_cents: i.unit_price_cents,
        subtotal_cents: i.subtotal_cents,
      })),
    })
  } catch (err) {
    if (err instanceof StockConflictError) {
      return res.status(409).json({ error: 'Conflicto de stock', unavailableProducts: err.unavailableProducts })
    }
    next(err)
  }
})

export default router