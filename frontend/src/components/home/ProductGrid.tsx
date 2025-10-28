"use client";
import { ProductCard } from "./ProductCard";
import { useState } from "react";
import { useProducts, type Product, type ProductsResponse } from "@/hooks/useProducts";

export function ProductGrid() {
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data, isLoading, isError, error, isFetching } = useProducts(page, limit);
  const productsData: ProductsResponse | undefined = data;

  const items = productsData?.data ?? [];
  const totalPages = productsData?.pagination.totalPages ?? 1;

  return (
    <section className="w-full bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-6">
        <h2 className="text-xl font-semibold mb-4">Productos</h2>

        {isLoading && <p className="text-slate-600">Cargando productos…</p>}
        {isError && <p className="text-red-600">Error: {(error as Error).message}</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-slate-600">Sin productos activos.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center gap-2">
            <button
              className="h-10 px-4 rounded-lg border border-[var(--color-border)] hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPage((pg) => Math.max(1, pg - 1))}
              disabled={page <= 1 || isFetching}
            >
              Anterior
            </button>
            <span className="text-sm text-slate-600">
              Página {page} de {totalPages}
            </span>
            <button
              className="h-10 px-4 rounded-lg border border-[var(--color-border)] hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPage((pg) => Math.min(totalPages, pg + 1))}
              disabled={page >= totalPages || isFetching}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
