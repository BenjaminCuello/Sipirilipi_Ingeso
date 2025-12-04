import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { type Product } from '../lib/api'
import { useToast } from '../lib/toast'
import { hasRole, logout } from '../lib/auth'

export default function CatalogPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.listProducts(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['products'] })
      const previous = queryClient.getQueryData<Product[]>(['products'])
      queryClient.setQueryData<Product[]>(['products'], (old = []) => old.filter((p) => p.id !== deletedId))
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['products'], ctx.previous)
      toast.push('error', 'No se pudo eliminar el producto')
    },
    onSuccess: () => {
      toast.push('success', 'Producto eliminado')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const canManage = hasRole('ADMIN', 'SELLER')

  const handleDelete = (id?: number) => {
    if (!id) return
    if (!window.confirm('Seguro que deseas eliminar este producto?')) return
    deleteMutation.mutate(id)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Catalogo</h1>
            <p className="text-sm text-gray-600">Gestiona tus productos disponibles en la tienda.</p>
          </div>
          <div className="flex items-center gap-3">
            {canManage && (
              <button
                onClick={() => navigate('/panel/products/new')}
                className="h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                Nuevo producto
              </button>
            )}
            <button
              onClick={handleLogout}
              className="h-10 px-4 rounded-lg border border-slate-200 text-sm text-gray-700 hover:bg-slate-100 transition"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <section className="container mx-auto p-6 space-y-6">
        {isLoading && <p className="text-gray-600">Cargando productos...</p>}
        {isError && <p className="text-red-600">Error: {(error as Error).message}</p>}

        {!isLoading && !isError && products.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">
            Aun no hay productos registrados.
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
                {product.imageUrl && (
                  <div className="h-40 rounded-xl overflow-hidden bg-slate-100 grid place-items-center">
                    <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                    {product.brand && <p className="text-sm text-gray-600">Marca: {product.brand}</p>}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="text-lg font-semibold text-indigo-600">
                  ${product.price.toLocaleString('es-CL')}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>Stock: {product.stock}</p>
                  {product.color && <p>Color: {product.color}</p>}
                  {product.category?.name && <p>Categoria: {product.category.name}</p>}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                {canManage && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/panel/products/${product.id}/edit`)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                    >
                      {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
