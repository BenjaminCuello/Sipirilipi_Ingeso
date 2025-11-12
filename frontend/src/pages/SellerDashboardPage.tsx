import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import SalesByMonthChart from '../components/dashboard/SalesByMonthChart';
import TopProductsChart from '../components/dashboard/TopProductsChart';
import LowStockTable from '../components/dashboard/LowStockTable';
import reportService from '../services/ReportService';

export default function SellerDashboardPage() {
  const salesQuery = useQuery({
    queryKey: ['reports', 'salesByMonth'],
    queryFn: () => reportService.getSalesByMonth(),
  });

  const topProductsQuery = useQuery({
    queryKey: ['reports', 'topProducts'],
    queryFn: () => reportService.getTopProducts(),
  });

  const lowStockQuery = useQuery({
    queryKey: ['reports', 'lowStock'],
    queryFn: () => reportService.getLowStockProducts(),
  });

  const anyLoading = salesQuery.isLoading || topProductsQuery.isLoading || lowStockQuery.isLoading;

  const anyError = useMemo(() => {
    if (salesQuery.error) return 'No se pudieron cargar las ventas por mes.';
    if (topProductsQuery.error) return 'No se pudieron cargar los productos destacados.';
    if (lowStockQuery.error) return 'No se pudo obtener el stock crítico.';
    return null;
  }, [salesQuery.error, topProductsQuery.error, lowStockQuery.error]);

  return (
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
  );
}