import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { isAuthenticated } from "@/lib/auth";
import CartService, { type ServerCart, type ServerCartItem } from "@/services/CartService";

export type CartProduct = {
  id: number;
  name: string;
  price_cents: number;
  image?: string | null;
  stock?: number | null;
};

export type CartItem = CartProduct & {
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  totalCents: number;
  // server sync helpers
  serverLoaded?: boolean;
  serverMap?: Record<number, number>; // productId -> cartItemId
  imageMap?: Record<number, string | null>; // productId -> image url
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (id: number) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  clear: () => void;
  setQuantity: (id: number, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  setFromServer: (cart: ServerCart) => void;
  syncFromServer: () => Promise<void>;
};

function recalc(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = items.reduce((sum, item) => sum + item.quantity * item.price_cents, 0);
  return { totalItems, totalCents };
}

const storage = typeof window !== "undefined" ? createJSONStorage<CartState>(() => window.localStorage) : undefined;

export const MAX_ITEM_QUANTITY = 10;
const MIN_ITEM_QUANTITY = 1;

const cartStore: StateCreator<CartState> = (set, get) => ({
  items: [],
  totalItems: 0,
  totalCents: 0,
  serverLoaded: false,
  serverMap: {},
  imageMap: {},
  setItems: (items: CartItem[]) => {
    set({ ...recalc(items), items });
  },
  setFromServer: (cart: ServerCart) => {
    const prev = get().items;
    const imageMap = get().imageMap ?? {};
    const items: CartItem[] = cart.items.map((ci: ServerCartItem) => {
      const image =
        imageMap[ci.productId] ?? prev.find((p) => p.id === ci.productId)?.image ?? null;
      return {
        id: ci.product.id,
        name: ci.product.name,
        price_cents: ci.product.price_cents,
        quantity: ci.quantity,
        image,
        stock: ci.product.stock,
      };
    });
    const serverMap: Record<number, number> = Object.fromEntries(cart.items.map((ci) => [ci.productId, ci.id]));
    const nextImageMap: Record<number, string | null> = { ...imageMap };
    for (const item of items) {
      nextImageMap[item.id] = item.image ?? null;
    }
    set({ ...recalc(items), items, serverLoaded: true, serverMap, imageMap: nextImageMap });
  },
  addItem: (product: CartProduct, quantity = 1) => {
    if (quantity <= 0) return;
    if (isAuthenticated()) {
      // recordar imagen localmente (aunque el servidor no la devuelva)
      if (typeof product.image !== 'undefined') {
        set((state: CartState) => ({
          ...state,
          imageMap: { ...(state.imageMap ?? {}), [product.id]: product.image ?? null },
        }));
      }
      // sync with server then update from response
      void CartService.add(product.id, quantity)
        .then((cart) => get().setFromServer(cart))
        .catch(() => {
          // fallback local if server fails
          set((state: CartState) => localAdd(state, product, quantity));
        });
      return;
    }
    set((state: CartState) => {
      const existing = state.items.find((item: CartItem) => item.id === product.id);
      const items = existing
        ? (() => {
            const capByStock = typeof product.stock === 'number' && product.stock > 0 ? product.stock : MAX_ITEM_QUANTITY;
            const newQuantity = Math.min(
              MAX_ITEM_QUANTITY,
              capByStock,
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
            const capByStock = typeof product.stock === 'number' && product.stock > 0 ? product.stock : MAX_ITEM_QUANTITY;
            const safeQuantity = Math.min(
              MAX_ITEM_QUANTITY,
              capByStock,
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
    if (isAuthenticated()) {
      const map = get().serverMap ?? {};
      const itemId = map[id];
      if (itemId) {
        void CartService.removeItem(itemId)
          .then((cart) => get().setFromServer(cart))
          .catch(() => {
            set((state: CartState) => localRemove(state, id));
          });
        return;
      } else {
        // try resolve by product id
        void CartService.updateByProductId(id, 0)
          .then((cart) => get().setFromServer(cart))
          .catch(() => set((state: CartState) => localRemove(state, id)));
        return;
      }
    }
    set((state: CartState) => {
      const items = state.items.filter((item: CartItem) => item.id !== id);
      return { ...recalc(items), items };
    });
  },
  increment: (id: number) => {
    if (isAuthenticated()) {
      const current = get().items.find((i) => i.id === id);
      const nextQty = (current?.quantity ?? 0) + 1;
      void CartService.updateByProductId(id, nextQty)
        .then((cart) => get().setFromServer(cart))
        .catch(() => {
          set((state: CartState) => localIncrement(state, id));
        });
      return;
    }
    set((state: CartState) => {
      let updated = false;
      const items = state.items.map((item: CartItem) => {
        if (item.id !== id) return item;
        const capByStock = typeof item.stock === 'number' && item.stock > 0 ? item.stock : MAX_ITEM_QUANTITY;
        if (item.quantity >= Math.min(MAX_ITEM_QUANTITY, capByStock)) return item;
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
    if (isAuthenticated()) {
      const current = get().items.find((i) => i.id === id);
      const nextQty = Math.max(0, (current?.quantity ?? 0) - 1);
      void CartService.updateByProductId(id, nextQty)
        .then((cart) => get().setFromServer(cart))
        .catch(() => set((state: CartState) => localDecrement(state, id)));
      return;
    }
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
    if (isAuthenticated()) {
      const current = get().items;
      // naive: delete each item on server
      (async () => {
        try {
          let cart: ServerCart | null = null;
          for (const it of current) {
            cart = await CartService.updateByProductId(it.id, 0);
          }
          if (cart) get().setFromServer(cart);
        } catch {
          set({ items: [], totalItems: 0, totalCents: 0 });
        }
      })();
      return;
    }
    set({ items: [], totalItems: 0, totalCents: 0 });
  },
  setQuantity: (id: number, quantity: number) => {
    if (isAuthenticated()) {
      void CartService.updateByProductId(id, quantity)
        .then((cart) => get().setFromServer(cart))
        .catch(() => {
          // fallback local set
          set((state: CartState) => localSetQuantity(state, id, quantity));
        });
      return;
    }
    set((state: CartState) => localSetQuantity(state, id, quantity));
  },
  syncFromServer: async () => {
    if (!isAuthenticated()) return;
    try {
      const server = await CartService.get();
      const local = get().items;
      // merge: push local items to server (add increments)
      let merged = server;
      for (const it of local) {
        if (it.quantity > 0) merged = await CartService.add(it.id, it.quantity);
      }
      get().setFromServer(merged);
    } catch {
      // ignore sync error; keep local
    }
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

// local helpers for fallback operations
function localAdd(state: CartState, product: CartProduct, quantity: number) {
  const existing = state.items.find((item: CartItem) => item.id === product.id);
  const items = existing
    ? (() => {
        const capByStock = typeof product.stock === 'number' && product.stock > 0 ? product.stock : MAX_ITEM_QUANTITY;
        const newQuantity = Math.min(
          MAX_ITEM_QUANTITY,
          capByStock,
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
        const capByStock = typeof product.stock === 'number' && product.stock > 0 ? product.stock : MAX_ITEM_QUANTITY;
        const safeQuantity = Math.min(
          MAX_ITEM_QUANTITY,
          capByStock,
          Math.max(MIN_ITEM_QUANTITY, quantity)
        );
        return [...state.items, { ...product, quantity: safeQuantity }];
      })();
  if (items === state.items) {
    return state;
  }
  return { ...recalc(items), items } as CartState;
}

function localRemove(state: CartState, id: number) {
  const items = state.items.filter((item: CartItem) => item.id !== id);
  return { ...recalc(items), items } as CartState;
}

function localIncrement(state: CartState, id: number) {
  let updated = false;
  const items = state.items.map((item: CartItem) => {
    if (item.id !== id) return item;
    const capByStock = typeof item.stock === 'number' && item.stock > 0 ? item.stock : MAX_ITEM_QUANTITY;
    if (item.quantity >= Math.min(MAX_ITEM_QUANTITY, capByStock)) return item;
    updated = true;
    return { ...item, quantity: item.quantity + 1 };
  });
  if (!updated) {
    return state as CartState;
  }
  return { ...recalc(items), items } as CartState;
}

function localDecrement(state: CartState, id: number) {
  const items = state.items
    .map((item: CartItem) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0);
  return { ...recalc(items), items } as CartState;
}

function localSetQuantity(state: CartState, id: number, quantity: number) {
  if (quantity <= 0) {
    const items = state.items.filter((item: CartItem) => item.id !== id);
    return { ...recalc(items), items } as CartState;
  }
  const safeQuantity = Math.min(MAX_ITEM_QUANTITY, Math.max(MIN_ITEM_QUANTITY, quantity));
  let changed = false;
  const items = state.items.map((item: CartItem) => {
    if (item.id !== id) return item;
    if (item.quantity === safeQuantity) return item;
    changed = true;
    return { ...item, quantity: safeQuantity };
  });
  if (!changed) {
    return state as CartState;
  }
  return { ...recalc(items), items } as CartState;
}
