import { apiFetch, API_BASE_URL } from "@/lib/api";

export type CatalogCategory = {
  id: number;
  name: string;
  slug: string;
};

export type CatalogProduct = {
  id: number;
  name: string;
  brand: string | null;
  description: string;
  color: string | null;
  price: number;
  price_cents: number;
  stock: number;
  isActive: boolean;
  is_active: boolean;
  category: CatalogCategory | null;
  imageUrl: string | null;
  thumbUrl: string | null;
  images?: { id: number; filename: string; originalUrl: string; thumbUrl: string; position: number }[];
  createdAt: string;
  updatedAt: string;
};

export type SearchParams = {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: number;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  brand?: string;
  sortBy?: "id" | "name" | "price_cents" | "createdAt";
  order?: "asc" | "desc";
  includeInactive?: boolean;
};

export type SearchResult = {
  data: CatalogProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const ProductService = {
  // helper media URL absolutas
  toAbsolute(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = API_BASE_URL.replace(/\/api$/, "");
    return `${base}${url.startsWith("/") ? url : `/${url}`}`;
  },

  async search(params: SearchParams = {}): Promise<SearchResult> {
    const query = buildQuery({
      page: params.page,
      limit: params.limit,
      q: params.q,
      categoryId: params.categoryId,
      categorySlug: params.categorySlug,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      color: params.color,
      brand: params.brand,
      sortBy: params.sortBy,
      order: params.order,
      includeInactive: params.includeInactive,
    });
    const res = await apiFetch<SearchResult>(`/products${query}`);
    return {
      ...res,
      data: res.data.map((p) => ({
        ...p,
        imageUrl: ProductService.toAbsolute(p.imageUrl),
        thumbUrl: ProductService.toAbsolute(p.thumbUrl),
        images: p.images?.map((img) => ({
          ...img,
          originalUrl: ProductService.toAbsolute(img.originalUrl) || "",
          thumbUrl: ProductService.toAbsolute(img.thumbUrl) || "",
        })),
      })),
    };
  },

  async suggestions(q: string, limit = 5): Promise<CatalogProduct[]> {
    const query = buildQuery({ q, limit });
    const items = await apiFetch<CatalogProduct[]>(`/products/suggestions${query}`);
    return items.map((p) => ({
      ...p,
      imageUrl: ProductService.toAbsolute(p.imageUrl),
      thumbUrl: ProductService.toAbsolute(p.thumbUrl),
      images: p.images?.map((img) => ({
        ...img,
        originalUrl: ProductService.toAbsolute(img.originalUrl) || "",
        thumbUrl: ProductService.toAbsolute(img.thumbUrl) || "",
      })),
    }));
  },

  async getById(id: number): Promise<CatalogProduct> {
    const p = await apiFetch<CatalogProduct>(`/products/public/${id}`);
    return {
      ...p,
      imageUrl: ProductService.toAbsolute(p.imageUrl),
      thumbUrl: ProductService.toAbsolute(p.thumbUrl),
      images: p.images?.map((img) => ({
        ...img,
        originalUrl: ProductService.toAbsolute(img.originalUrl) || "",
        thumbUrl: ProductService.toAbsolute(img.thumbUrl) || "",
      })),
    };
  },

  async listCategories(): Promise<CatalogCategory[]> {
    return apiFetch<CatalogCategory[]>("/categories");
  },

  async createCategory(name: string): Promise<CatalogCategory> {
    return apiFetch<CatalogCategory>("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
      auth: true,
    });
  },
};

export default ProductService;
