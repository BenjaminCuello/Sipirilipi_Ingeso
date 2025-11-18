import { z } from 'zod'

const checkoutItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1),
})

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
})

export type CheckoutPayload = z.infer<typeof checkoutSchema>

export function normalizeCartItems(items: CheckoutPayload['items']): CheckoutPayload['items'] {
  const map = new Map<number, number>()
  for (const item of items) {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity)
  }
  return Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }))
}