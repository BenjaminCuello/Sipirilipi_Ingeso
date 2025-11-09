import type { LowStockReport } from '../../services/ReportService'

const numberFormatter = new Intl.NumberFormat('es-CL')

type LowStockTableProps = {
  data: LowStockReport[]
  isLoading?: boolean
  error?: string | null
}

export default function LowStockTable({ data, isLoading, error }: LowStockTableProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200/60 p-6 h-full flex flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold text-gray-900">Stock bajo</h2>
        <p className="text-sm text-gray-500">Productos que requieren reposición</p>
      </header>
      <div className="flex-1">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-sm text-red-500">{error}</div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Buen trabajo, no hay productos con stock crítico.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Producto
                  </th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stock actual
                  </th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Mínimo sugerido
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {data.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-right">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        {numberFormatter.format(item.stock)} uds
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">{numberFormatter.format(item.minimum)} uds</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
