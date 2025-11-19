import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthPayload } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', async (_req, res, next) => {
  try {
    const user = res.locals.user as AuthPayload

    const orders = await prisma.order.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    const response = orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      total: order.total,
      status: order.status,
      items: order.items.map((item) => ({
        orderItemId: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    }))

    res.json(response)
  } catch (err) {
    next(err)
  }
})

export default router

