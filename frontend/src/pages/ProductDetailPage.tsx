"use client";

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import ProductService, { CatalogProduct } from "@/services/ProductService";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const productId = Number(params.id);

  const enabled = Number.isFinite(productId);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: () => ProductService.getById(productId),
    enabled,
  });

  const product = data as CatalogProduct | undefined;
  const [activeIndex, setActiveIndex] = useState(0);

  const breadcrumbs = useMemo(() => {
    const items = [{ label: "Inicio", href: "/" }];
    if (product?.category?.name) {
      const q = encodeURIComponent(product.category.name);
      items.push({ label: product.category.name, href: `/buscar?categoryId=${product.category.id}&q=${q}` });
    }
    if (product?.name) {
      items.push({ label: product.name });
    }
    return items;
  }, [product?.category?.id, product?.category?.name, product?.name]);

  return (
    <main className="min-h-dvh bg-white">
      <Header initialQuery={product?.name ?? ""} />
      <section className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <nav className="text-sm text-gray-500 flex gap-2 flex-wrap">
          {breadcrumbs.map((item, index) => (
            <span key={item.label} className="flex items-center gap-2">
              {item.href ? (
                <button type="button" onClick={() => navigate(item.href)} className="hover:text-indigo-600 transition">
                  {item.label}
                </button>
              ) : (
                <span>{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>

        {!enabled ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-gray-600">
            Identificador de producto invalido.
          </div>
        ) : isLoading ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-gray-600">
            Cargando informacion del producto...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-red-600">
            Error: {(error as Error).message}
          </div>
        ) : !product ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-gray-600">
            Producto no encontrado o no disponible.
          </div>
        ) : (
          <article className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-slate-50 aspect-square overflow-hidden grid place-items-center text-sm text-slate-500">
                {product?.images && product.images.length > 0 ? (
                  <img
                    src={product.images[Math.max(0, Math.min(activeIndex, product.images.length - 1))].originalUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : product?.imageUrl || product?.thumbUrl ? (
                  <img
                    src={product.imageUrl ?? product.thumbUrl ?? undefined}
                    alt={product?.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  "Imagen no disponible"
                )}
              </div>
              {product?.images && product.images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {product.images.map((img, idx) => (
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
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
                {product.brand && <p className="text-sm text-gray-600 mt-1">Marca: {product.brand}</p>}
              </div>
              <div className="text-2xl font-semibold text-indigo-600">{formatPrice(product.price)}</div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                {product.color && (
                  <div className="rounded-lg border border-gray-200 p-3">
                    <span className="block text-xs uppercase text-gray-500">Color</span>
                    <span>{product.color}</span>
                  </div>
                )}
                {product.category?.name && (
                  <div className="rounded-lg border border-gray-200 p-3">
                    <span className="block text-xs uppercase text-gray-500">Categoria</span>
                    <span>{product.category.name}</span>
                  </div>
                )}
                <div className="rounded-lg border border-gray-200 p-3">
                  <span className="block text-xs uppercase text-gray-500">Stock disponible</span>
                  <span>{product.stock}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Volver
                </button>
              </div>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
