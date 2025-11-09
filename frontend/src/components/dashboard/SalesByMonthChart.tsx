import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SalesByMonthPoint } from '../../services/ReportService'

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

type SalesByMonthChartProps = {
  data: SalesByMonthPoint[]
  isLoading?: boolean
  error?: string | null
}

export default function SalesByMonthChart({ data, isLoading, error }: SalesByMonthChartProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200/60 p-6 h-full flex flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold text-gray-900">Ventas por mes</h2>
        <p className="text-sm text-gray-500">Resultados del último año calendario</p>
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
            No hay datos disponibles por ahora.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                stroke="#64748b"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={value => currencyFormatter.format(value).replace('$', '$ ')}
              />
              <Tooltip
                formatter={(value: number) => currencyFormatter.format(value)}
                labelStyle={{ color: '#334155', fontWeight: 600 }}
                contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
