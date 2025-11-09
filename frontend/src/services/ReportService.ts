import { mockReportService } from '../mocks/MockReportService'

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

export const reportService: ReportService = mockReportService

export default reportService
