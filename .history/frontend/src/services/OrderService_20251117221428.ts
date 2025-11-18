import { apiFetch } from '../lib/api'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export type OrderItem = {
  productId: number
  quantity: number
  unit_price_cents: number
  subtotal_cents: number
}

export type Order = {
  id: number
  status: OrderStatus
  total_cents: number
  createdAt: string
  items: OrderItem[]
}

export const OrderService = {
  async checkout(items: { productId: number; quantity: number }[]) {
    return apiFetch<{ id: number; status: OrderStatus; total_cents: number; createdAt: string }>(
      '/checkout',
      {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ items }),
      }
    )
  },
  async listMine(): Promise<Order[]> {
    return apiFetch<Order[]>('/orders/mine', { auth: true })
  },
  async get(id: number): Promise<Order> {
    return apiFetch<Order>(`/orders/${id}`, { auth: true })
  },
}

export default OrderService