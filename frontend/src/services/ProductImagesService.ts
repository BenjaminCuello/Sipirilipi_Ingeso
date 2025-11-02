import { TOKEN_KEY } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

export type ProductImage = {
  id: number;
  filename: string;
  originalUrl: string;
  thumbUrl: string;
  position: number;
};

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return {} as Record<string, string>;
  return { Authorization: `Bearer ${token}` } as Record<string, string>;
}

export const ProductImagesService = {
  async upload(productId: number, files: FileList | File[]): Promise<ProductImage[]> {
    const form = new FormData();
    Array.from(files).forEach(file => form.append("files", file));

    const res = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
      method: "POST",
      body: form,
      headers: {
        ...authHeaders(),
      },
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.error ?? `HTTP ${res.status}`);
    }

    const data = (await res.json()) as ProductImage[];
    return data;
  },

  async remove(productId: number, imageId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
      method: "DELETE",
      headers: {
        ...authHeaders(),
      },
    });
    if (!res.ok && res.status !== 204) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.error ?? `HTTP ${res.status}`);
    }
  },

  async reorder(productId: number, order: number[]): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/products/${productId}/images/reorder`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ order }),
    });
    if (!res.ok && res.status !== 204) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.error ?? `HTTP ${res.status}`);
    }
  },
};

export default ProductImagesService;

