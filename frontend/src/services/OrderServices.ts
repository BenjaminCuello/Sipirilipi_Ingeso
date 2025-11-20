import { apiFetch } from '@/lib/api'
import { type CartItem as CartStoreItem } from '@/store/cartStore'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  orderItemId: number
  productId: number
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: number
  createdAt: string
  total: number
  status: OrderStatus
  items: OrderItem[]
}

type CheckoutResponse = {
  orderId: number
  status: OrderStatus
  total_cents: number
}

export const OrderService = {
  async listMine(): Promise<Order[]> {
    const orders = await apiFetch<Order[]>('/orders', { auth: true })
    return orders
  },

  async create(items: CartStoreItem[]): Promise<{ orderId: number; createdAt: string; total: number }> {
    if (!items || items.length === 0) {
      throw new Error('No se puede crear una orden con un carrito vacío.')
    }

    const payload = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    }

    const res = await apiFetch<CheckoutResponse>('/checkout', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(payload),
    })

    return {
      orderId: res.orderId,
      createdAt: new Date().toISOString(),
      total: res.total_cents,
    }
  },
}

export default OrderService

