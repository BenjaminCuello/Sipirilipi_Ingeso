import { z } from 'zod';

// Esquema para un solo item en el carrito
const checkoutItemSchema = z.object({
  productId: z.number().int().positive('El ID del producto debe ser un número positivo.'),
  quantity: z.number().int().min(1, 'La cantidad mínima es 1.'),
});

// Esquema para el cuerpo de la petición de checkout
export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Se requiere al menos un item para el checkout.'),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;


export function normalizeCartItems(items: CheckoutPayload['items']): CheckoutPayload['items'] {
  const itemMap = new Map<number, number>();

  for (const item of items) {
    const currentQty = itemMap.get(item.productId) || 0;
    itemMap.set(item.productId, currentQty + item.quantity);
  }

  const normalizedItems: CheckoutPayload['items'] = [];
  for (const [productId, quantity] of itemMap.entries()) {
    normalizedItems.push({ productId, quantity });
  }
  
  return normalizedItems;
}