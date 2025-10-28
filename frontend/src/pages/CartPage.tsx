import { Header } from "@/components/common/Header";
import { CartItemRow } from "@/components/cart/CartItemRow";
import {
  useCartStore,
  selectCartItems,
  selectCartTotal,
  type CartState,
  type CartItem,
  MAX_ITEM_QUANTITY,
} from "@/store/cartStore";
import { Button } from "@/components/ui/Button";
import { formatCLPFromCents } from "@/lib/format";
import { Link } from "react-router-dom";

export default function CartPage() {
  const items = useCartStore(selectCartItems);
  const totalCents = useCartStore(selectCartTotal);
  const increment = useCartStore((state: CartState) => state.increment);
  const decrement = useCartStore((state: CartState) => state.decrement);
  const removeItem = useCartStore((state: CartState) => state.removeItem);
  const clear = useCartStore((state: CartState) => state.clear);

  const subtotal = totalCents;
  const total = totalCents;

  const isEmpty = items.length === 0;

  return (
    <main className="min-h-dvh bg-slate-50">
      <Header />
      <section className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
          <div className="flex-1 rounded-2xl bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Carrito de compras</h1>
                <p className="text-sm text-slate-600">Revisa los productos antes de continuar.</p>
              </div>
              {!isEmpty && (
                <button
                  type="button"
                  onClick={() => clear()}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition"
                >
                  Vaciar carrito
                </button>
              )}
            </header>

            <div className="mt-6">
              {isEmpty ? (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-slate-50 p-8 text-center">
                  <h2 className="text-lg font-semibold text-slate-800">Tu carrito está vacío</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Explora nuestro catálogo y agrega productos para verlos aquí.
                  </p>
                  <Link
                    to="/"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Volver al catálogo
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item: CartItem) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onIncrement={() => increment(item.id)}
                      onDecrement={() => decrement(item.id)}
                      onRemove={() => removeItem(item.id)}
                      maxQuantity={MAX_ITEM_QUANTITY}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="mt-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm lg:mt-0">
            <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCLPFromCents(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Envío</span>
                <span>Pendiente de calcular</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCLPFromCents(total)}</span>
              </div>
            </div>

            <Button className="mt-6 w-full" disabled={isEmpty}>
              Proceder al pago
            </Button>

            <p className="mt-3 text-xs text-slate-500">
              Al continuar confirmarás tu información de contacto y método de pago.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
