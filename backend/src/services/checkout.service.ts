import { prisma } from '../lib/prisma'
import type { CheckoutPayload } from '../schemas/checkout.schema'

// Error personalizado para manejar conflictos de stock
export class StockConflictError extends Error {
  public unavailableProducts: number[]

  constructor(message: string, unavailableProducts: number[]) {
    super(message)
    this.name = 'StockConflictError'
    this.unavailableProducts = unavailableProducts
  }
}

/**
 * Procesa una orden de checkout en una única transacción.
 * @param userId - El ID del usuario que realiza la compra.
 * @param items - Los items del carrito, ya normalizados.
 * @returns La orden creada.
 */
export async function processCheckout(userId: number, items: CheckoutPayload['items']) {
  const productIds = items.map((item) => item.productId)

  // 1. Obtener los productos de la BD para verificar precios y stock actuales
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, is_active: true },
  })

  // 2. Validar que todos los productos existen y hay stock suficiente
  const unavailableProducts: number[] = []
  let total = 0

  const itemsWithPrice = items.map((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId)
    if (!product || product.stock < cartItem.quantity) {
      unavailableProducts.push(cartItem.productId)
    }
    const subtotal = (product?.price_cents ?? 0) * cartItem.quantity
    total += subtotal
    return {
      ...cartItem,
      unitPrice: product?.price_cents ?? 0,
      subtotal,
    }
  })

  if (unavailableProducts.length > 0) {
    throw new StockConflictError('Stock insuficiente o producto no disponible.', unavailableProducts)
  }

  // 3. Ejecutar la creación de la orden como una transacción
  const createdOrder = await prisma.$transaction(async (tx) => {
    // a. Crear la Orden
    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: 'paid', // Directamente a 'paid' por el pago simulado
        items: {
          create: itemsWithPrice.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
    })

    // b. Crear el Registro de Pago simulado
    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: 'simulado',
      },
    })

    // c. Decrementar el stock de cada producto
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return order
  })

  return createdOrder
}

