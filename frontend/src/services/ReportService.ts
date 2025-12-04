import { apiFetch } from '@/lib/api'

export type SalesByMonthPoint = {
  month: string
  total: number
}

export type TopProductReport = {
  id: number
  name: string
  totalSold: number
  revenue: number
}

export type LowStockReport = {
  id: number
  name: string
  stock: number
  minimum: number
}

export interface ReportService {
  getSalesByMonth: () => Promise<SalesByMonthPoint[]>
  getTopProducts: () => Promise<TopProductReport[]>
  getLowStockProducts: () => Promise<LowStockReport[]>
}

export const reportService: ReportService = {
  async getSalesByMonth(): Promise<SalesByMonthPoint[]> {
    try {
      return await apiFetch<SalesByMonthPoint[]>('/reports/sales-by-month', { auth: true })
    } catch {
      return []
    }
  },

  async getTopProducts(): Promise<TopProductReport[]> {
    try {
      return await apiFetch<TopProductReport[]>('/reports/top-products', { auth: true })
    } catch {
      return []
    }
  },

  async getLowStockProducts(): Promise<LowStockReport[]> {
    try {
      return await apiFetch<LowStockReport[]>('/reports/low-stock', { auth: true })
    } catch {
      return []
    }
  },
}

export default reportService