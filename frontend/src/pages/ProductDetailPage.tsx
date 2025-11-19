import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import ProductService, { type CatalogProduct } from "@/services/ProductService";
import { formatPrice } from "@/hooks/useProducts";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const isValidId = Number.isInteger(productId) && productId > 0;

  const { data, isLoading, isError, error } = useQuery<CatalogProduct, Error>({
    queryKey: ["product-detail", productId],
    queryFn: () => ProductService.getById(productId),
    enabled: isValidId,
    staleTime: 1000 * 30,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const priceCents = useMemo(() => {
    if (!data) return 0;
    if (typeof data.price_cents === "number") return data.price_cents;
    return Math.round(data.price ?? 0);
  }, [data]);

  const formattedPrice = formatPrice(priceCents);

  const coverUrl = useMemo(() => {
    if (!data) return undefined;
    if (data.images && data.images.length > 0) return data.images[Math.max(0, Math.min(activeIndex, data.images.length - 1))].originalUrl;
    return (data.imageUrl ?? data.thumbUrl) ?? undefined;
  }, [data, activeIndex]);

  return (
    <main className="min-h-dvh bg-white">
      <Header />
      <section className="w-full max-w-[1100px] mx-auto px-6 py-10">
        {!isValidId && <p className="text-red-600">Producto no valido.</p>}
        {isLoading && <p className="text-slate-700">Cargando producto...</p>}
        {isError && <p className="text-red-600">{error?.message}</p>}
        {!isLoading && !isError && data && (
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-slate-50 aspect-square overflow-hidden grid place-items-center text-sm text-slate-500">
                {coverUrl ? (
                  <img src={coverUrl} alt={data.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <span>Imagen no disponible</span>
                )}
              </div>
              {data.images && data.images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {data.images.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      className={`h-16 w-16 rounded-md border ${idx === activeIndex ? 'border-indigo-500' : 'border-gray-200'} overflow-hidden`}
                      onClick={() => setActiveIndex(idx)}
                    >
                      <img src={img.thumbUrl} alt={img.filename} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{data.name}</h1>
                <div className="mt-2 text-[var(--color-primary)] text-3xl font-bold">{formattedPrice}</div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Descripcion</h2>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {data.description || 'Este producto aun no tiene una descripcion disponible.'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Stock disponible: {data.stock}</p>
                <AddToCartButton
                  product={{ id: data.id, name: data.name, price_cents: priceCents, image: coverUrl, stock: data.stock ?? undefined }}
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
