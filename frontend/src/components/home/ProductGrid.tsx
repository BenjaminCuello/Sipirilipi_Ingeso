"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import ProductService, { CatalogProduct } from "@/services/ProductService";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductGrid() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["home-products", { page, limit }],
    queryFn: () => ProductService.search({ page, limit }),
    keepPreviousData: true,
  });

  const items = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <section className="w-full bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-6">
        <h2 className="text-xl font-semibold mb-4">Productos destacados</h2>

        {isLoading && <p className="text-slate-600">Cargando productos...</p>}
        {isError && <p className="text-red-600">Error: {(error as Error).message}</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-slate-600">Sin productos disponibles.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product: CatalogProduct) => (
            <ProductCard
              key={product.id}
              title={product.name}
              price={formatPrice(product.price)}
              img={product.imageUrl ?? undefined}
              onOpen={() => navigate(`/producto/${product.id}`)}
            />
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
              Pagina {page} de {totalPages}
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
