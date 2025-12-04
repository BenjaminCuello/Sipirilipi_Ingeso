import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type AuthPayload } from '../middleware/auth'
import { Role, TicketStatus } from '@prisma/client'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const router = Router()

const createTicketSchema = z.object({
  orderId: z.number().int().positive(),
  reason: z.string().min(10, 'Describe el motivo del cambio'),
  contact: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(6).max(20).optional().or(z.literal('')).transform((value) => value || undefined),
  }),
  items: z
    .array(
      z.object({
        orderItemId: z.number().int().positive(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, 'Selecciona al menos un producto'),
})

const listTicketsSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  orderId: z
    .preprocess((value) => (value === undefined ? undefined : Number(value)), z.number().int().positive().optional()),
  customerEmail: z.string().email().optional(),
  from: z.preprocess((value) => (value ? new Date(String(value)) : undefined), z.date().optional()),
  to: z.preprocess((value) => (value ? new Date(String(value)) : undefined), z.date().optional()),
})

const updateStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
  notes: z.string().max(500).optional(),
})

const TICKET_WINDOW_MS = 10 * 24 * 60 * 60 * 1000 // 10 dias

const ticketInclude = {
  order: {
    select: {
      id: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
  items: {
    include: {
      orderItem: {
        select: {
          id: true,
          productId: true,
          product: { select: { id: true, name: true } },
          quantity: true,
        },
      },
    },
  },
} as const

function ticketToResponse(ticket: any) {
  return {
    id: ticket.id,
    code: ticket.code,
    status: ticket.status,
    reason: ticket.reason,
    notes: ticket.notes ?? null,
    orderId: ticket.orderId,
    expiresAt: ticket.expiresAt,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    contact: {
      name: ticket.contactName,
      email: ticket.contactEmail,
      phone: ticket.contactPhone ?? null,
    },
    order: {
      id: ticket.order.id,
      createdAt: ticket.order.createdAt,
      customer: ticket.order.user,
    },
    items: ticket.items.map((item: any) => ({
      orderItemId: item.orderItemId,
      productId: item.orderItem.productId,
      productName: item.orderItem.product?.name ?? 'Producto',
      quantity: item.quantity,
    })),
  }
}

function isWithinWindow(orderDate: Date) {
  const expires = new Date(orderDate.getTime() + TICKET_WINDOW_MS)
  return { expires, allowed: Date.now() <= expires.getTime() }
}

function buildTicketCode() {
  const base = randomUUID().split('-')[0].toUpperCase()
  const year = new Date().getFullYear()
  return `TCK-${year}-${base}`
}

async function createTicketRecord(data: Parameters<typeof prisma.ticket.create>[0]['data']) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.ticket.create({
        data: { ...data, code: buildTicketCode() },
        include: ticketInclude,
      })
    } catch (error: any) {
      if (error?.code === 'P2002' && error?.meta?.target?.includes('code')) {
        continue
      }
      throw error
    }
  }
  throw new Error('No se pudo generar el codigo del ticket')
}

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = createTicketSchema.parse(req.body)
    const user = res.locals.user as AuthPayload

    const order = await prisma.order.findFirst({
      where: { id: payload.orderId, userId: user.sub },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' })
    }

    const { expires, allowed } = isWithinWindow(order.createdAt)
    if (!allowed) {
      return res.status(400).json({ error: 'La orden supera el limite de 10 dias para solicitar cambios' })
    }

    const existing = await prisma.ticket.findFirst({
      where: { orderId: order.id, status: { in: [TicketStatus.pending, TicketStatus.approved] } },
    })
    if (existing) {
      return res.status(409).json({ error: 'Ya existe un ticket abierto para esta orden' })
    }

    const itemsMap = new Map(order.items.map((item) => [item.id, item]))

    const uniqueIds = new Set<number>()
    const itemsData = payload.items.map((item) => {
      if (uniqueIds.has(item.orderItemId)) {
        throw new Error('Este producto ya fue agregado al ticket.')
      }
      uniqueIds.add(item.orderItemId)
      const orderItem = itemsMap.get(item.orderItemId)
      if (!orderItem) {
        throw new Error('El producto seleccionado no pertenece a esta orden.')
      }
      if (item.quantity > orderItem.quantity) {
        throw new Error('La cantidad seleccionada es mayor a la comprada en la orden.')
      }
      return { orderItemId: orderItem.id, quantity: item.quantity }
    })

    const ticket = await createTicketRecord({
      orderId: order.id,
      reason: payload.reason,
      contactName: payload.contact.name,
      contactEmail: payload.contact.email,
      contactPhone: payload.contact.phone,
      status: TicketStatus.pending,
      expiresAt: expires,
      items: {
        create: itemsData,
      },
    })

    res.status(201).json(ticketToResponse(ticket))
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: error.issues })
    }
    if (
      error instanceof Error &&
      ['Producto', 'Cantidad', 'No se puede'].some(prefix => error.message.startsWith(prefix))
    ) {
      return res.status(400).json({ error: error.message })
    }
    next(error)
  }
})

router.get('/', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const filters = listTicketsSchema.parse(req.query)
    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.orderId) where.orderId = filters.orderId
    if (filters.from || filters.to) {
      where.createdAt = {
        gte: filters.from,
        lte: filters.to,
      }
    }
    if (filters.customerEmail) {
      where.order = { user: { email: { equals: filters.customerEmail, mode: 'insensitive' } } }
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: ticketInclude,
      orderBy: { createdAt: 'desc' },
    })

    res.json(tickets.map(ticketToResponse))
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Filtros invalidos', details: error.issues })
    }
    next(error)
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' })
    }

    const user = res.locals.user as AuthPayload

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        ...ticketInclude,
        order: {
          select: {
            id: true,
            createdAt: true,
            userId: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' })
    }

    if (user.role === Role.CUSTOMER && ticket.order.userId !== user.sub) {
      return res.status(403).json({ error: 'Prohibido' })
    }

    res.json(ticketToResponse(ticket))
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/status', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' })
    }

    const payload = updateStatusSchema.parse(req.body)

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status: payload.status, notes: payload.notes },
      include: ticketInclude,
    })

    res.json(ticketToResponse(ticket))
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: error.issues })
    }
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Ticket no encontrado' })
    }
    next(error)
  }
})

export default router
