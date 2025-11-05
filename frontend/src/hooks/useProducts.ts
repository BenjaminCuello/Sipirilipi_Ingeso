import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type Product = {
  id: number;
  name: string;
  price_cents: number;
  stock: number;
  is_active: boolean;
  imageUrl?: string | null;
  thumbUrl?: string | null;
  image_url?: string | null;
  thumb_url?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductsResponse = {
  data: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export function useProducts(page = 1, limit = 12) {
  return useQuery<ProductsResponse>({
    queryKey: ["products", page, limit],
    queryFn: () => apiFetch<ProductsResponse>(`/products?page=${page}&limit=${limit}`),
    staleTime: 1000 * 30,
  });
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(
    cents,
  );
}
