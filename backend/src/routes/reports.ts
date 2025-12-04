import { Router, Request, Response } from 'express'
import { Role } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

// Solo ADMIN / SELLER pueden acceder a reportes
router.use(requireAuth, requireRole(Role.ADMIN, Role.SELLER))

// GET /api/reports/sales-by-month
router.get('/sales-by-month', async (_req: Request, res: Response) => {
  try {
    const sales = await prisma.$queryRaw<{ month: string; total: bigint }[]>`
      SELECT 
        TO_CHAR(p.paid_at, 'Mon') as month,
        EXTRACT(MONTH FROM p.paid_at) as month_num,
        SUM(p.amount_cents) as total
      FROM payments p
      INNER JOIN orders o ON p.order_id = o.id
      WHERE o.status IN ('paid', 'shipped', 'delivered')
        AND p.paid_at >= DATE_TRUNC('year', CURRENT_DATE)
      GROUP BY TO_CHAR(p.paid_at, 'Mon'), EXTRACT(MONTH FROM p.paid_at)
      ORDER BY month_num
    `

    const result = sales.map(s => ({
      month: s.month,
      total: Number(s.total),
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching sales by month:', error)
    res.status(500).json({ error: 'Error al obtener ventas por mes' })
  }
})

// GET /api/reports/top-products
router.get('/top-products', async (_req: Request, res: Response) => {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          subtotal: 'desc',
        },
      },
      take: 5,
    })

    const productIds = topProducts.map(p => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    })

    const productMap = new Map(products.map(p => [p.id, p.name]))

    const result = topProducts.map(p => ({
      id: p.productId,
      name: productMap.get(p.productId) || 'Producto eliminado',
      totalSold: p._sum.quantity || 0,
      revenue: p._sum.subtotal || 0,
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching top products:', error)
    res.status(500).json({ error: 'Error al obtener top productos' })
  }
})

// GET /api/reports/low-stock (bonus - ya está en el mock)
router.get('/low-stock', async (_req: Request, res: Response) => {
  try {
    const lowStock = await prisma.product.findMany({
      where: {
        stock: { lt: 5 },
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
      orderBy: { stock: 'asc' },
      take: 10,
    })

    const result = lowStock.map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      minimum: 5, // umbral configurable
    }))

    res.json(result)
  } catch (error) {
    console.error('Error fetching low stock:', error)
    res.status(500).json({ error: 'Error al obtener productos con bajo stock' })
  }
})

export default router
