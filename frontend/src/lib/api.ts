import { TOKEN_KEY } from './auth'

type FetchOptions = RequestInit & {
  auth?: boolean
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_BASE ??
  'http://localhost:4000/api'

type ApiProduct = {
  id: number
  name: string
  price_cents: number
  stock: number
  is_active: boolean
  createdAt?: string
  updatedAt?: string
}

export type Product = {
  id?: number
  name: string
  price: number
  stock: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

function resolvePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function withAuthHeader(
  headers: Record<string, string>,
  auth: boolean
): Record<string, string> {
  if (!auth) return headers
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return headers
  return { ...headers, Authorization: `Bearer ${token}` }
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = false, headers = {}, ...rest } = options

  const res = await fetch(`${API_BASE_URL}${resolvePath(path)}`, {
    headers: withAuthHeader(
      {
        'Content-Type': 'application/json',
        ...(headers as Record<string, string>),
      },
      auth
    ),
    credentials: rest.credentials ?? 'omit',
    ...rest,
  })

  let json: any = null
  if (res.status !== 204) {
    try {
      json = await res.json()
    } catch {
      json = null
    }
  }

  if (!res.ok) {
    const message = json?.error ?? `HTTP ${res.status}`
    throw new Error(message)
  }

  return json as T
}

const fromApiProduct = (product: ApiProduct): Product => ({
  id: product.id,
  name: product.name,
  price: product.price_cents,
  stock: product.stock,
  isActive: product.is_active,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
})

const toApiProduct = (product: Product) => ({
  name: product.name,
  price_cents: Math.max(0, Math.round(product.price)),
  stock: Math.max(0, Math.round(product.stock)),
  is_active: product.isActive,
})

export const api = {
  listProducts: async () => {
    const res = await apiFetch<{ data: ApiProduct[] }>(
      '/products?includeInactive=true&limit=100',
      { auth: true }
    )
    return res.data.map(fromApiProduct)
  },
  getProduct: async (id: number) => {
    const product = await apiFetch<ApiProduct>(`/products/${id}`, { auth: true })
    return fromApiProduct(product)
  },
  createProduct: async (product: Product) => {
    const created = await apiFetch<ApiProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(toApiProduct(product)),
      auth: true,
    })
    return fromApiProduct(created)
  },
  updateProduct: async (id: number, product: Product) => {
    const updated = await apiFetch<ApiProduct>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toApiProduct(product)),
      auth: true,
    })
    return fromApiProduct(updated)
  },
  deleteProduct: (id: number) =>
    apiFetch<void>(`/products/${id}`, { method: 'DELETE', auth: true }),
}

export default api
