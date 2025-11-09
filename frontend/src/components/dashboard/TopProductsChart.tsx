import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TopProductReport } from '../../services/ReportService'

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

type TopProductsChartProps = {
  data: TopProductReport[]
  isLoading?: boolean
  error?: string | null
}

export default function TopProductsChart({ data, isLoading, error }: TopProductsChartProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200/60 p-6 h-full flex flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold text-gray-900">Top productos</h2>
        <p className="text-sm text-gray-500">Ventas y facturación estimada</p>
      </header>
      <div className="flex-1 min-h-[240px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-sm text-red-500">{error}</div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No hay productos destacados todavía.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" tickFormatter={value => currencyFormatter.format(value)} />
              <YAxis dataKey="name" type="category" width={160} tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => currencyFormatter.format(value)}
                labelStyle={{ color: '#334155', fontWeight: 600 }}
                contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
              />
              <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
