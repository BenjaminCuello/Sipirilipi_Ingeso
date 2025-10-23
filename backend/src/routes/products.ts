import { Router } from 'express'
import { Role } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

const productSelect = {
  id: true,
  name: true,
  price_cents: true,
  stock: true,
  is_active: true,
  createdAt: true,
  updatedAt: true,
} as const

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['id', 'name', 'price_cents', 'createdAt']).optional().default('id'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  includeInactive: z.coerce.boolean().optional().default(false),
})

const productBodySchema = z
  .object({
    name: z.string().trim().min(1),
    stock: z.coerce.number().int().min(0),
    price: z.coerce.number().min(0).optional(),
    price_cents: z.coerce.number().int().min(0).optional(),
    isActive: z.coerce.boolean().optional(),
    is_active: z.coerce.boolean().optional(),
  })
  .refine(
    data => typeof data.price === 'number' || typeof data.price_cents === 'number',
    { message: 'Precio requerido', path: ['price'] }
  )

const productIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
})

function mapProduct(product: any) {
  return {
    ...product,
    price: product.price_cents,
    isActive: product.is_active,
  }
}

router.get('/', async (req, res, next) => {
  try {
    const parsed = listQuerySchema.parse({
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
      includeInactive: req.query.includeInactive,
    })

    const skip = (parsed.page - 1) * parsed.limit

    const where = parsed.includeInactive ? {} : { is_active: true }

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [parsed.sortBy]: parsed.order,
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parsed.limit,
        select: productSelect,
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / parsed.limit))

    res.json({
      data: items.map(mapProduct),
      pagination: {
        page: parsed.page,
        limit: parsed.limit,
        total,
        totalPages,
      },
    })
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    next(err)
  }
})

router.get('/:id', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params)
    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    })
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(mapProduct(product))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    next(err)
  }
})

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const parsed = productBodySchema.parse(req.body)
    const priceSource =
      typeof parsed.price_cents === 'number'
        ? parsed.price_cents
        : Math.round(parsed.price ?? 0)
    const priceCents = Math.max(0, priceSource)

    const product = await prisma.product.create({
      data: {
        name: parsed.name,
        price_cents: priceCents,
        stock: parsed.stock,
        is_active: parsed.is_active ?? parsed.isActive ?? true,
      },
      select: productSelect,
    })

    res.status(201).json(mapProduct(product))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

router.put('/:id', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params)
    const parsed = productBodySchema.parse(req.body)
    const priceSource =
      typeof parsed.price_cents === 'number'
        ? parsed.price_cents
        : Math.round(parsed.price ?? 0)
    const priceCents = Math.max(0, priceSource)

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: parsed.name,
        price_cents: priceCents,
        stock: parsed.stock,
        is_active: parsed.is_active ?? parsed.isActive ?? true,
      },
      select: productSelect,
    })

    res.json(mapProduct(product))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    next(err)
  }
})

router.delete('/:id', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params)
    await prisma.product.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    next(err)
  }
})

export default router
