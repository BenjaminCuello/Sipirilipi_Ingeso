import { z } from 'zod'

export const cartItemAddSchema = z.object({
  productId: z.coerce.number().int().min(1),
  qty: z.coerce.number().int().min(1).max(999),
})

export const cartItemUpdateSchema = z.object({
  qty: z.coerce.number().int().min(1).max(999),
})

export const cartItemIdParamSchema = z.object({
  itemId: z.coerce.number().int().min(1),
})
