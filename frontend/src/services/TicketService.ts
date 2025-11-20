import { apiFetch } from '@/lib/api'

type TicketItemPayload = {
  orderItemId: number
  quantity: number
}

export type ContactInfo = {
  name: string
  email: string
  phone?: string
}

export type TicketStatus = 'pending' | 'approved' | 'rejected' | 'closed'

export type TicketProductItem = {
  orderItemId: number
  productId: number
  productName: string
  quantity: number
}

export type TicketOrderSummary = {
  id: number
  createdAt: string
  customer?: {
    id: number
    name: string | null
    email: string
  }
}

export type TicketResponse = {
  id: number
  code: string
  status: TicketStatus
  reason: string
  notes: string | null
  orderId: number
  expiresAt: string
  createdAt: string
  updatedAt: string
  contact: ContactInfo
  order: TicketOrderSummary
  items: TicketProductItem[]
}

export type CreateTicketPayload = {
  orderId: number
  reason: string
  contact: ContactInfo
  items: TicketItemPayload[]
}

export type TicketFilters = {
  status?: TicketStatus
  orderId?: number
  customerEmail?: string
  from?: string
  to?: string
}

function buildQuery(filters: TicketFilters): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

const TicketService = {
  async create(payload: CreateTicketPayload): Promise<TicketResponse> {
    return apiFetch<TicketResponse>('/tickets', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(payload),
    })
  },

  async list(filters: TicketFilters = {}): Promise<TicketResponse[]> {
    return apiFetch<TicketResponse[]>(`/tickets${buildQuery(filters)}`, { auth: true })
  },

  async updateStatus(id: number, payload: { status: TicketStatus; notes?: string }): Promise<TicketResponse> {
    return apiFetch<TicketResponse>(`/tickets/${id}/status`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    })
  },
}

export default TicketService
