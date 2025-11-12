import { apiFetch } from "@/lib/api";

export type ServerCartItem = {
  id: number; // cart item id
  productId: number;
  quantity: number;
  subtotal_cents: number;
  product: {
    id: number;
    name: string;
    price_cents: number;
    stock: number;
    is_active: boolean;
  };
};

export type ServerCart = {
  id: number;
  userId: number;
  items: ServerCartItem[];
  totals: { totalItems: number; totalCents: number };
  updatedAt: string;
};

export const CartService = {
  async get(): Promise<ServerCart> {
    return apiFetch<ServerCart>("/cart", { auth: true });
  },

  async add(productId: number, qty: number): Promise<ServerCart> {
    return apiFetch<ServerCart>("/cart/items", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ productId, qty }),
    });
  },

  async updateItem(itemId: number, qty: number): Promise<ServerCart> {
    return apiFetch<ServerCart>(`/cart/items/${itemId}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ qty }),
    });
  },

  async removeItem(itemId: number): Promise<ServerCart> {
    return apiFetch<ServerCart>(`/cart/items/${itemId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  async updateByProductId(productId: number, qty: number): Promise<ServerCart> {
    const cart = await CartService.get();
    const existing = cart.items.find((it) => it.productId === productId);
    if (!existing) {
      if (qty <= 0) return cart;
      return CartService.add(productId, qty);
    }
    if (qty <= 0) {
      return CartService.removeItem(existing.id);
    }
    return CartService.updateItem(existing.id, qty);
  },
};

export default CartService;

