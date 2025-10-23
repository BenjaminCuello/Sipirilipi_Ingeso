export type Product = {
  id?: number
  name: string
  price: number
  stock: number
  isActive: boolean
}

// base de la API configurable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

// helper generico con control de errores robusto
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    credentials: 'include', // mantiene cookies/sesión si backend las usa
    ...init,
  })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      const text = await res.text()
      if (text) message = text
    }
    throw new Error(message)
  }

  return (await res.json()) as T
}

// endpoints específicos de productos
export const api = {
  listProducts: () => apiFetch<Product[]>('/products'),
  getProduct: (id: number) => apiFetch<Product>(`/products/${id}`),
  createProduct: (p: Product) => apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(p) }),
  updateProduct: (id: number, p: Product) => apiFetch<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deleteProduct: (id: number) => apiFetch<void>(`/products/${id}`, { method: 'DELETE' }),
}

export default api
