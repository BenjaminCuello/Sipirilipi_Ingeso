import type {
  LowStockReport,
  ReportService,
  SalesByMonthPoint,
  TopProductReport,
} from '../services/ReportService'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const salesByMonth: SalesByMonthPoint[] = [
  { month: 'Ene', total: 2800000 },
  { month: 'Feb', total: 2450000 },
  { month: 'Mar', total: 3100000 },
  { month: 'Abr', total: 3300000 },
  { month: 'May', total: 3600000 },
  { month: 'Jun', total: 2900000 },
  { month: 'Jul', total: 3750000 },
  { month: 'Ago', total: 3980000 },
  { month: 'Sep', total: 3420000 },
  { month: 'Oct', total: 4100000 },
  { month: 'Nov', total: 4520000 },
  { month: 'Dic', total: 4685000 },
]

const topProducts: TopProductReport[] = [
  { id: 1, name: 'Notebook ASUS Vivobook', totalSold: 120, revenue: 168000000 },
  { id: 2, name: 'Monitor LG 27" 144hz', totalSold: 95, revenue: 142500000 },
  { id: 3, name: 'Silla Gamer Cougar', totalSold: 82, revenue: 57400000 },
  { id: 4, name: 'Teclado Mecánico HyperX', totalSold: 150, revenue: 52500000 },
  { id: 5, name: 'GPU RTX 4070 Ti', totalSold: 34, revenue: 61200000 },
]

const lowStockProducts: LowStockReport[] = [
  { id: 11, name: 'Mouse Logitech G203', stock: 8, minimum: 15 },
  { id: 12, name: 'SSD NVMe 1TB Kingston', stock: 5, minimum: 12 },
  { id: 13, name: 'Auriculares Razer Kraken', stock: 4, minimum: 10 },
  { id: 14, name: 'Fuente Corsair 750W', stock: 6, minimum: 10 },
  { id: 15, name: 'Webcam Logitech Brio', stock: 3, minimum: 8 },
]

export const mockReportService: ReportService = {
  async getSalesByMonth() {
    await wait(200)
    return salesByMonth
  },
  async getTopProducts() {
    await wait(200)
    return topProducts
  },
  async getLowStockProducts() {
    await wait(200)
    return lowStockProducts
  },
}

export default mockReportService
