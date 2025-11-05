import { create, type StoreApi } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartProduct = {
  id: number;
  name: string;
  price_cents: number;
  image?: string | null;
};

export type CartItem = CartProduct & {
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  totalCents: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: number) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  clear: () => void;
  setQuantity: (id: number, quantity: number) => void;
};

function recalc(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = items.reduce((sum, item) => sum + item.quantity * item.price_cents, 0);
  return { totalItems, totalCents };
}

const storage = typeof window !== "undefined" ? createJSONStorage<CartState>(() => window.localStorage) : undefined;

type CartSetState = StoreApi<CartState>["setState"];

export const MAX_ITEM_QUANTITY = 10;
const MIN_ITEM_QUANTITY = 1;

const cartStore = (set: CartSetState): CartState => ({
  items: [],
  totalItems: 0,
  totalCents: 0,
  addItem: (product: CartProduct, quantity = 1) => {
    if (quantity <= 0) return;
    set((state: CartState) => {
      const existing = state.items.find((item: CartItem) => item.id === product.id);
      const items = existing
        ? (() => {
            const newQuantity = Math.min(
              MAX_ITEM_QUANTITY,
              Math.max(MIN_ITEM_QUANTITY, existing.quantity + quantity)
            );
            if (newQuantity === existing.quantity) {
              return state.items;
            }
            return state.items.map((item: CartItem) =>
              item.id === product.id ? { ...item, quantity: newQuantity } : item
            );
          })()
        : (() => {
            const safeQuantity = Math.min(
              MAX_ITEM_QUANTITY,
              Math.max(MIN_ITEM_QUANTITY, quantity)
            );
            return [...state.items, { ...product, quantity: safeQuantity }];
          })();
      if (items === state.items) {
        return state;
      }
      return { ...recalc(items), items };
    });
  },
  removeItem: (id: number) => {
    set((state: CartState) => {
      const items = state.items.filter((item: CartItem) => item.id !== id);
      return { ...recalc(items), items };
    });
  },
  increment: (id: number) => {
    set((state: CartState) => {
      let updated = false;
      const items = state.items.map((item: CartItem) => {
        if (item.id !== id) return item;
        if (item.quantity >= MAX_ITEM_QUANTITY) return item;
        updated = true;
        return { ...item, quantity: item.quantity + 1 };
      });
      if (!updated) {
        return state;
      }
      return { ...recalc(items), items };
    });
  },
  decrement: (id: number) => {
    set((state: CartState) => {
      const items = state.items
        .map((item: CartItem) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);
      return { ...recalc(items), items };
    });
  },
  clear: () => {
    set({ items: [], totalItems: 0, totalCents: 0 });
  },
  setQuantity: (id: number, quantity: number) => {
    if (quantity <= 0) {
      set((state: CartState) => {
        const items = state.items.filter((item: CartItem) => item.id !== id);
        return { ...recalc(items), items };
      });
      return;
    }
    set((state: CartState) => {
      const safeQuantity = Math.min(
        MAX_ITEM_QUANTITY,
        Math.max(MIN_ITEM_QUANTITY, quantity)
      );
      let changed = false;
      const items = state.items.map((item: CartItem) => {
        if (item.id !== id) return item;
        if (item.quantity === safeQuantity) return item;
        changed = true;
        return { ...item, quantity: safeQuantity };
      });
      if (!changed) {
        return state;
      }
      return { ...recalc(items), items };
    });
  },
});

export const useCartStore = create<CartState>()(
  persist<CartState>(cartStore, {
    name: "sipirilipi-cart-v1",
    ...(storage ? { storage } : {}),
  })
);

export const selectCartCount = (state: CartState) => state.totalItems;
export const selectCartTotal = (state: CartState) => state.totalCents;
export const selectCartItemQuantity = (id: number) => (state: CartState) =>
  state.items.find((item) => item.id === id)?.quantity ?? 0;
export const selectCartItems = (state: CartState) => state.items;
