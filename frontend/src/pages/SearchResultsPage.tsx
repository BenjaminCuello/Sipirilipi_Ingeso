"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import ProductService from "@/services/ProductService";
import type { CatalogCategory, CatalogProduct } from "@/services/ProductService";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-asc", label: "Precio ascendente" },
  { value: "price-desc", label: "Precio descendente" },
  { value: "newest", label: "Mas nuevos" },
];

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = (searchParams.get("q") || "").trim();
  const page = parseNumber(searchParams.get("page")) ?? 1;
  const categoryIdParam = parseNumber(searchParams.get("categoryId"));
  const minPriceParam = parseNumber(searchParams.get("minPrice"));
  const maxPriceParam = parseNumber(searchParams.get("maxPrice"));
  const colorParam = (searchParams.get("color") || "").trim();
  const sortParam = searchParams.get("sort") || "relevance";

  const [formState, setFormState] = useState({
    categoryId: categoryIdParam ? String(categoryIdParam) : "",
    minPrice: minPriceParam ? String(minPriceParam) : "",
    maxPrice: maxPriceParam ? String(maxPriceParam) : "",
    color: colorParam,
    sort: sortParam,
  });

  useEffect(() => {
    setFormState({
      categoryId: categoryIdParam ? String(categoryIdParam) : "",
      minPrice: minPriceParam ? String(minPriceParam) : "",
      maxPrice: maxPriceParam ? String(maxPriceParam) : "",
      color: colorParam,
      sort: sortParam,
    });
  }, [categoryIdParam, minPriceParam, maxPriceParam, colorParam, sortParam]);

  const sortSelection = useMemo(() => {
    switch (sortParam) {
      case "price-asc":
        return { sortBy: "price_cents" as const, order: "asc" as const };
      case "price-desc":
        return { sortBy: "price_cents" as const, order: "desc" as const };
      case "newest":
        return { sortBy: "createdAt" as const, order: "desc" as const };
      default:
        return { sortBy: "id" as const, order: "asc" as const };
    }
  }, [sortParam]);

  const searchVariables = useMemo(
    () => ({
      page,
      limit: 12,
      q: query,
      categoryId: categoryIdParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      color: colorParam || undefined,
      sortBy: sortSelection.sortBy,
      order: sortSelection.order,
    }),
    [page, query, categoryIdParam, minPriceParam, maxPriceParam, colorParam, sortSelection]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search-results", searchVariables],
    queryFn: () => ProductService.search(searchVariables),
    enabled: query.length > 0,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: () => ProductService.listCategories(),
  });

  const pagination = data?.pagination;
  const items = data?.data ?? [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query) return;

    const params = new URLSearchParams(searchParams);
    params.set("q", query);
    params.set("page", "1");

    if (formState.categoryId) {
      params.set("categoryId", formState.categoryId);
    } else {
      params.delete("categoryId");
    }

    if (formState.minPrice) {
      params.set("minPrice", formState.minPrice);
    } else {
      params.delete("minPrice");
    }

    if (formState.maxPrice) {
      params.set("maxPrice", formState.maxPrice);
    } else {
      params.delete("maxPrice");
    }

    if (formState.color) {
      params.set("color", formState.color);
    } else {
      params.delete("color");
    }

    if (formState.sort && formState.sort !== "relevance") {
      params.set("sort", formState.sort);
    } else {
      params.delete("sort");
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    setFormState({
      categoryId: "",
      minPrice: "",
      maxPrice: "",
      color: "",
      sort: "relevance",
    });
    setSearchParams(params);
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
  };

  if (!query) {
    return (
      <main className="min-h-dvh bg-white">
        <Header />
        <section className="max-w-4xl mx-auto px-6 py-12 text-center space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">Busca un producto</h1>
          <p className="text-gray-600">Utiliza la barra de busqueda para encontrar articulos.</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Volver al inicio
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <Header initialQuery={query} />
      <section className="w-full max-w-[1200px] mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resultados para "{query}"</h1>
          {pagination && (
            <p className="text-sm text-gray-600 mt-1">
              {pagination.total} articulos encontrados
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              id="categoryId"
              value={formState.categoryId}
              onChange={(event) => setFormState((prev) => ({ ...prev, categoryId: event.target.value }))}
              className="w-full h-11 rounded-lg border border-gray-300 px-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              <option value="">Todas las categorias</option>
              {categories.map((category: CatalogCategory) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Precio minimo
            </label>
            <input
              id="minPrice"
              value={formState.minPrice}
              onChange={(event) => setFormState((prev) => ({ ...prev, minPrice: event.target.value.replace(/[^0-9]/g, "") }))}
              placeholder="0"
              className="w-full h-11 rounded-lg border border-gray-300 px-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Precio maximo
            </label>
            <input
              id="maxPrice"
              value={formState.maxPrice}
              onChange={(event) => setFormState((prev) => ({ ...prev, maxPrice: event.target.value.replace(/[^0-9]/g, "") }))}
              placeholder="1000000"
              className="w-full h-11 rounded-lg border border-gray-300 px-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              id="color"
              value={formState.color}
              onChange={(event) => setFormState((prev) => ({ ...prev, color: event.target.value }))}
              placeholder="Ej: Negro"
              className="w-full h-11 rounded-lg border border-gray-300 px-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              id="sort"
              value={formState.sort}
              onChange={(event) => setFormState((prev) => ({ ...prev, sort: event.target.value }))}
              className="w-full h-11 rounded-lg border border-gray-300 px-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-11 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              Aplicar filtros
            </button>
          </div>
        </form>

        {isLoading ? (
          <p className="text-gray-600">Cargando resultados...</p>
        ) : isError ? (
          <p className="text-red-600">Error: {(error as Error).message}</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-gray-200 p-6 text-center text-gray-600">
            No encontramos articulos que coincidan con la busqueda.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((product: CatalogProduct) => (
              <article key={product.id} className="border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-40 aspect-square rounded-lg overflow-hidden bg-slate-100 grid place-items-center text-xs text-slate-500">
                    {product.imageUrl || product.thumbUrl ? (
                      <img
                        src={product.thumbUrl ?? product.imageUrl ?? undefined}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      "Imagen no disponible"
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/producto/${product.id}`)}
                        className="text-left text-lg font-semibold text-gray-900 hover:text-indigo-600 transition"
                      >
                        {product.name}
                      </button>
                      <span className="text-lg font-semibold text-indigo-600">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      {product.brand && <span>Marca: {product.brand}</span>}
                      {product.color && <span>Color: {product.color}</span>}
                      {product.category?.name && <span>Categoria: {product.category.name}</span>}
                      <span>Stock: {product.stock}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/producto/${product.id}`)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
                      >
                        Ver detalle
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="h-10 px-4 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Pagina {pagination.page} de {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="h-10 px-4 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
