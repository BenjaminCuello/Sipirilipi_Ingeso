import { TOKEN_KEY } from './auth'

type FetchOptions = RequestInit & {
  auth?: boolean
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_BASE ??
  'http://localhost:4000/api'

const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

function toAbsoluteMedia(url: string | null | undefined): string | null {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${UPLOAD_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

export type ApiProductImage = {
  id: number
  filename: string
  originalUrl: string
  thumbUrl: string
  position: number
}

type ApiProduct = {
  id: number
  name: string
  brand?: string | null
  description: string
  color?: string | null
  price: number
  price_cents: number
  stock: number
  isActive: boolean
  is_active: boolean
  categoryId?: number | null
  category?: { id: number; name: string; slug: string } | null
  image_url?: string | null
  thumb_url?: string | null
  imageUrl?: string | null
  thumbUrl?: string | null
  images?: ApiProductImage[]
  createdAt?: string
  updatedAt?: string
}

export type Product = {
  id?: number
  name: string
  brand?: string | null
  description: string
  color?: string | null
  price: number
  stock: number
  isActive: boolean
  categoryId?: number | null
  category?: { id: number; name: string; slug: string } | null
  imageUrl?: string | null
  thumbUrl?: string | null
  images?: ApiProductImage[]
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

  let json: unknown = null
  if (res.status !== 204) {
    try {
      json = await res.json()
    } catch {
      json = null
    }
  }

  if (!res.ok) {
    const errorPayload = (json as { error?: string } | null) ?? null
    const message = errorPayload?.error ?? `HTTP ${res.status}`
    const apiError: any = new Error(message)
    apiError.status = res.status
    apiError.payload = json
    throw apiError
  }

  return json as T
}

const fromApiProduct = (product: ApiProduct): Product => {
  const imageUrl = product.image_url ?? product.imageUrl ?? null
  const thumbUrl = product.thumb_url ?? product.thumbUrl ?? null
  const images = (product.images ?? []).map((img) => ({
    ...img,
    originalUrl: toAbsoluteMedia(img.originalUrl) || '',
    thumbUrl: toAbsoluteMedia(img.thumbUrl) || '',
  }))
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? null,
    description: product.description,
    color: product.color ?? null,
    price: product.price_cents,
    stock: product.stock,
    isActive: product.is_active ?? product.isActive,
    categoryId: product.categoryId ?? product.category?.id ?? null,
    category: product.category ?? null,
    imageUrl: toAbsoluteMedia(imageUrl),
    thumbUrl: toAbsoluteMedia(thumbUrl),
    images,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

const toApiProduct = (product: Product) => ({
  name: product.name,
  brand: product.brand ?? null,
  description: product.description ?? '',
  color: product.color ?? null,
  price_cents: Math.max(0, Math.round(product.price)),
  stock: Math.max(0, Math.round(product.stock)),
  is_active: product.isActive,
  categoryId: product.categoryId ?? null,
  imageUrl: product.imageUrl ?? null,
  thumbUrl: product.thumbUrl ?? null,
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
