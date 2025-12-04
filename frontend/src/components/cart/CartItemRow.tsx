"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { type CartItem, MAX_ITEM_QUANTITY } from "@/store/cartStore";
import { formatCLPFromCents } from "@/lib/format";

const MIN_QUANTITY = 1;

type Props = {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  maxQuantity?: number;
};

export function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  maxQuantity = MAX_ITEM_QUANTITY,
}: Props) {
  const canDecrease = item.quantity > MIN_QUANTITY;
  const canIncrease = item.quantity < maxQuantity;

  return (
    <li className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 grid place-items-center">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-slate-500">Sin imagen</span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-900">{item.name}</h3>
            <p className="text-xs text-slate-500">Precio unitario: {formatCLPFromCents(item.price_cents)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition"
            aria-label={`Eliminar ${item.name}`}
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-slate-50 px-2 py-1">
            <button
              type="button"
              onClick={onDecrement}
              disabled={!canDecrease}
              className="h-8 w-8 rounded-full grid place-items-center text-slate-600 disabled:opacity-30"
              aria-label={`Reducir cantidad de ${item.name}`}
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-slate-700">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrement}
              disabled={!canIncrease}
              className="h-8 w-8 rounded-full grid place-items-center text-slate-600 disabled:opacity-30"
              aria-label={`Aumentar cantidad de ${item.name}`}
            >
              <Plus size={16} />
            </button>
          </div>

          <p className="text-sm font-semibold text-slate-900">
            Total: {formatCLPFromCents(item.price_cents * item.quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}
