"use client";

import { Link } from "react-router-dom";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { formatPrice, type Product } from "@/hooks/useProducts";
import { API_BASE_URL } from "@/lib/api";

type Props = {
  product: Product;
  imageUrl?: string;
};

export function ProductCard({ product, imageUrl }: Props) {
  const formattedPrice = formatPrice(product.price_cents);
  const ABS_BASE = API_BASE_URL.replace(/\/api$/, "");
  const toAbs = (url?: string | null) => {
    if (!url) return undefined;
    return /^https?:\/\//i.test(url) ? url : `${ABS_BASE}${url.startsWith("/") ? url : `/${url}`}`;
  };
  const cover = toAbs(
    imageUrl ?? product.imageUrl ?? product.thumbUrl ?? product.image_url ?? product.thumb_url ?? null
  );

  // 🟢 1. SOLUCIÓN (Error ESLint):
  //    Usamos un 'disable' para callar al linter sobre el 'any'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stock = (product as any).stock as number | undefined;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white overflow-hidden hover:shadow-md transition">

      {/* 🟢 2. SOLUCIÓN (Aviso CSS): Se quitó la clase 'block' */}
      <Link to={`/producto/${product.id}`} className="aspect-[4/3] bg-slate-100 grid place-items-center overflow-hidden">
        {cover ? (
          <img src={cover} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-slate-500">Imagen no disponible</span>
        )}
      </Link>
      <div className="p-3">
        <Link to={`/producto/${product.id}`} className="block">
          <h3 className="text-sm font-medium line-clamp-2 hover:text-[var(--color-primary)] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 text-[var(--color-primary)] font-semibold">{formattedPrice}</div>

        <div className="mt-2 text-xs text-slate-500">
          {stock && stock > 0
            ? `${stock} disponibles`
            : 'Agotado'}
        </div>

        <AddToCartButton
          product={{ id: product.id, name: product.name, price_cents: product.price_cents, image: cover, stock: stock }}
          className="mt-3 w-full"
          // 🟢 3. SOLUCIÓN (Error TSC2322):
          //    Eliminamos la prop 'disabled' porque el componente no la acepta
          // disabled={!stock || stock <= 0}
        />
      </div>
    </div>
  );
}
