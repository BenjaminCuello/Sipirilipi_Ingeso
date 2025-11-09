import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { logout } from '../lib/auth'
import SalesByMonthChart from '../components/dashboard/SalesByMonthChart'
import TopProductsChart from '../components/dashboard/TopProductsChart'
import LowStockTable from '../components/dashboard/LowStockTable'
import reportService from '../services/ReportService'

export default function SellerDashboardPage() {
  const navigate = useNavigate()

  const salesQuery = useQuery({
    queryKey: ['reports', 'salesByMonth'],
    queryFn: () => reportService.getSalesByMonth(),
  })

  const topProductsQuery = useQuery({
    queryKey: ['reports', 'topProducts'],
    queryFn: () => reportService.getTopProducts(),
  })

  const lowStockQuery = useQuery({
    queryKey: ['reports', 'lowStock'],
    queryFn: () => reportService.getLowStockProducts(),
  })

  const anyLoading = salesQuery.isLoading || topProductsQuery.isLoading || lowStockQuery.isLoading

  const anyError = useMemo(() => {
    if (salesQuery.error) return 'No se pudieron cargar las ventas por mes.'
    if (topProductsQuery.error) return 'No se pudieron cargar los productos destacados.'
    if (lowStockQuery.error) return 'No se pudo obtener el stock crítico.'
    return null
  }, [salesQuery.error, topProductsQuery.error, lowStockQuery.error])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleGoToProducts = () => {
    navigate('/panel/products')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-gray-900">Panel de control</h1>
              <p className="text-sm text-gray-600">Resumen de ventas, productos destacados y alertas de stock</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGoHome}
                className="h-10 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                Ir al inicio
              </button>
              <button
                onClick={handleGoToProducts}
                className="h-10 px-4 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition text-sm font-medium"
              >
                Gestionar productos
              </button>
              <button
                onClick={handleLogout}
                className="h-10 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-sm font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {anyError && !anyLoading && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{anyError}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <SalesByMonthChart
              data={salesQuery.data ?? []}
              isLoading={salesQuery.isLoading}
              error={salesQuery.error ? 'Sin datos de ventas por ahora.' : null}
            />
          </div>
          <TopProductsChart
            data={topProductsQuery.data ?? []}
            isLoading={topProductsQuery.isLoading}
            error={topProductsQuery.error ? 'Sin información de top productos.' : null}
          />
          <LowStockTable
            data={lowStockQuery.data ?? []}
            isLoading={lowStockQuery.isLoading}
            error={lowStockQuery.error ? 'Sin datos de stock crítico.' : null}
          />
        </div>
      </section>
    </main>
  )
}
