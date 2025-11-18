import { prisma } from '../lib/prisma'
import type { CheckoutPayload } from '../schemas/checkout.schema'

export class StockConflictError extends Error {
  unavailableProducts: number[]
  constructor(message: string, unavailableProducts: number[]) {
    super(message)
    this.name = 'StockConflictError'
    this.unavailableProducts = unavailableProducts
  }
}

export async function processCheckout(userId: number, items: CheckoutPayload['items']) {
  const productIds = items.map(i => i.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, is_active: true } })

  const unavailable: number[] = []
  let total = 0
  const priced = items.map(it => {
    const product = products.find(p => p.id === it.productId)
    if (!product || product.stock < it.quantity) {
      unavailable.push(it.productId)
    }
    const unit = product?.price_cents ?? 0
    const subtotal = unit * it.quantity
    total += subtotal
    return { ...it, unitPrice: unit, subtotal }
  })

  if (unavailable.length) {
    throw new StockConflictError('Stock insuficiente o producto no disponible', unavailable)
  }

  const order = await prisma.$transaction(async tx => {
    const created = await tx.order.create({
      data: {
        userId,
        status: 'paid', // pago simulado directo
        total_cents: total,
        items: {
          create: priced.map(p => ({
            productId: p.productId,
            qty: p.quantity,
            unit_price_cents: p.unitPrice,
            subtotal_cents: p.subtotal,
          })),
        },
      },
      include: { items: true },
    })

    await tx.payment.create({
      data: { orderId: created.id, amount_cents: total, method: 'simulado' },
    })

    for (const p of priced) {
      await tx.product.update({
        where: { id: p.productId },
        data: { stock: { decrement: p.quantity } },
      })
    }

    return created
  })

  return order
}

export async function listUserOrders(userId: number) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { id: 'desc' },
    include: { items: true },
  })
  return orders
}

export async function getOrder(userId: number, id: number) {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: true },
  })
  return order
}