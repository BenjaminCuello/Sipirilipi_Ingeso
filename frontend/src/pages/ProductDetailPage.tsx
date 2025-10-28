import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { formatPrice } from "@/hooks/useProducts";
import { apiFetch } from "@/lib/api";

type ProductDetail = {
  id: number;
  name: string;
  price: number;
  price_cents?: number;
  stock: number;
  isActive: boolean;
  description?: string | null;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const isValidId = Number.isInteger(productId) && productId > 0;

  const { data, isLoading, isError, error } = useQuery<ProductDetail>({
    queryKey: ["product", productId],
    queryFn: () => apiFetch<ProductDetail>(`/products/${productId}`),
    enabled: isValidId,
    staleTime: 1000 * 30,
  });

  const priceCents = useMemo(() => {
    if (!data) return 0;
    if (typeof data.price_cents === "number") return data.price_cents;
    return Math.round(data.price ?? 0);
  }, [data]);

  const formattedPrice = formatPrice(priceCents);

  return (
    <main className="min-h-dvh bg-white">
      <Header />
      <section className="w-full max-w-[1100px] mx-auto px-6 py-10">
        {!isValidId && <p className="text-red-600">Producto no válido.</p>}
        {isLoading && <p className="text-slate-700">Cargando producto…</p>}
        {isError && <p className="text-red-600">{(error as Error).message}</p>}
        {!isLoading && !isError && data && (
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-[var(--color-border)] bg-slate-50 aspect-square grid place-items-center">
              <span className="text-slate-500">Imagen del producto</span>
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{data.name}</h1>
                <div className="mt-2 text-[var(--color-primary)] text-3xl font-bold">{formattedPrice}</div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Descripción</h2>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {data.description ?? "Este producto aún no tiene una descripción disponible."}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Stock disponible: {data.stock}</p>
                <AddToCartButton
                  product={{ id: data.id, name: data.name, price_cents: priceCents }}
                  className="mt-4 w-full md:w-auto"
                  variant="primary"
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
