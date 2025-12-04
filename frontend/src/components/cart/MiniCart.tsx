"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  useCartStore,
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  type CartItem,
  type CartState,
  MAX_ITEM_QUANTITY,
} from "@/store/cartStore";
import { formatCLPFromCents } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export function MiniCart() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const items = useCartStore(selectCartItems);
  const totalItems = useCartStore(selectCartCount);
  const totalCents = useCartStore(selectCartTotal);
  const increment = useCartStore((state: CartState) => state.increment);
  const decrement = useCartStore((state: CartState) => state.decrement);
  const removeItem = useCartStore((state: CartState) => state.removeItem);
  const clear = useCartStore((state: CartState) => state.clear);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const formattedTotal = useMemo(() => formatCLPFromCents(totalCents), [totalCents]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-10 w-10 grid place-items-center rounded-full hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Abrir carrito"
      >
        <ShoppingCart />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[var(--color-accent)] text-[11px] font-semibold text-white grid place-items-center">
            {totalItems}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] rounded-xl border border-white/10 bg-[var(--color-header)] text-white shadow-xl">
          <div className="p-4">
            <header className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Tu carrito</p>
                <p className="text-xs text-white/70">{totalItems} producto(s)</p>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => clear()}
                  className="text-xs text-white/70 hover:text-white transition"
                >
                  Vaciar
                </button>
              )}
            </header>

            <div className="mt-3 max-h-64 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <p className="text-sm text-white/80">Tu carrito está vacío.</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item: CartItem) => (
                    <li key={item.id} className="rounded-lg bg-white/10 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {item.image && (
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-white/10 shrink-0">
                              <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                            </div>
                          )}
                          <p className="text-sm font-medium leading-tight">{item.name}</p>
                          <p className="text-xs text-white/70">
                            {formatCLPFromCents(item.price_cents)} c/u
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-white/60 hover:text-white"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrement(item.id)}
                            className="h-7 w-7 rounded-full border border-white/30 grid place-items-center hover:bg-white/10"
                            aria-label={`Reducir cantidad de ${item.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => increment(item.id)}
                            disabled={item.quantity >= MAX_ITEM_QUANTITY}
                            className="h-7 w-7 rounded-full border border-white/30 grid place-items-center hover:bg-white/10 disabled:opacity-30"
                            aria-label={`Aumentar cantidad de ${item.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCLPFromCents(item.quantity * item.price_cents)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="mt-4 border-t border-white/10 pt-3 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Total</span>
                <span className="font-semibold">{formattedTotal}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Seguir comprando
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setOpen(false);
                    navigate("/carrito");
                  }}
                >
                  Ver carrito
                </Button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
