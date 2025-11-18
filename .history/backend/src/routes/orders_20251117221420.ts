import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { listUserOrders, getOrder } from '../services/checkout.service'

const router = Router()

router.use(requireAuth)

router.get('/mine', async (_req, res, next) => {
  try {
    const user = res.locals.user
    const orders = await listUserOrders(user.sub)
    res.json(
      orders.map(o => ({
        id: o.id,
        status: o.status,
        total_cents: o.total_cents,
        createdAt: o.createdAt,
        items: o.items.map(i => ({
          productId: i.productId,
          quantity: i.qty,
          unit_price_cents: i.unit_price_cents,
          subtotal_cents: i.subtotal_cents,
        })),
      }))
    )
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const user = res.locals.user
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' })
    const order = await getOrder(user.sub, id)
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' })
    res.json({
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
    next(err)
  }
})

export default router