import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hasRole, logout } from '../lib/auth'
import api, { type Product } from '../lib/api'
import { useToast } from '../lib/toast'

type FormState = {
  name: string
  price: string
  stock: string
  isActive: boolean
}

const emptyForm: FormState = {
  name: '',
  price: '',
  stock: '',
  isActive: true,
}

export default function CatalogPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.listProducts(),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    if (!showForm) {
      setErrors({})
    }
  }, [showForm])

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['products'] })
      const previous = queryClient.getQueryData<Product[]>(['products'])
      queryClient.setQueryData<Product[]>(['products'], (old = []) => old.filter((p) => p.id !== deletedId))
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['products'], ctx.previous)
      }
      toast.push('error', 'No se pudo eliminar el producto')
    },
    onSuccess: () => {
      toast.push('success', 'Producto eliminado')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: Product) => api.createProduct(payload),
    onSuccess: () => {
      toast.push('success', 'Producto creado')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      closeForm()
    },
    onError: () => {
      toast.push('error', 'No se pudo crear el producto')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Product }) => api.updateProduct(id, payload),
    onSuccess: () => {
      toast.push('success', 'Producto actualizado')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      closeForm()
    },
    onError: () => {
      toast.push('error', 'No se pudo actualizar el producto')
    },
  })

  const formPending = createMutation.isPending || updateMutation.isPending

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(product: Product) {
    if (!product.id) return
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      isActive: product.isActive,
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(values: FormState) {
    const nextErrors: Record<string, string> = {}
    if (!values.name.trim()) nextErrors.name = 'El nombre es requerido'

    const priceNumber = Number(values.price)
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      nextErrors.price = 'Precio invalido'
    }

    const stockNumber = Number(values.stock)
    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      nextErrors.stock = 'Stock invalido'
    }
    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload: Product = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      isActive: form.isActive,
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  function handleDelete(id?: number) {
    if (!id) return
    if (!window.confirm('Seguro que deseas eliminar este producto?')) return
    deleteMutation.mutate(id)
  }

  const canManage = hasRole('ADMIN', 'SELLER')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Catalogo</h1>
            {canManage && (
              <button
                onClick={() => navigate('/panel/products')}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Ir al panel
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100 active:scale-95 transition"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      <section className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-600">Zona privada: aqui va tu catalogo.</p>
          {canManage && (
            <button
              onClick={openCreate}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 transition"
            >
              Nuevo producto
            </button>
          )}
        </div>

        {isLoading && <div className="text-slate-600">Cargando productos...</div>}
        {isError && <div className="text-red-600">Error: {(error as Error).message}</div>}

        {!isLoading && !isError && (
          <>
            {products.length === 0 ? (
              <div className="text-slate-600">Sin productos activos.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <article key={p.id} className="rounded-2xl border p-4 bg-white shadow-sm space-y-2">
                    <div>
                      <h2 className="font-semibold">{p.name}</h2>
                      <p className="text-sm text-slate-500">Precio: ${p.price.toLocaleString('es-CL')}</p>
                      <p className="text-sm text-slate-500">Stock: {p.stock}</p>
                      <span
                        className={`inline-block mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {canManage && (
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex-1 rounded-lg border px-3 py-1.5 hover:bg-slate-100 transition text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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
          </>
        )}

        {canManage && showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Editar producto' : 'Crear producto'}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Nombre
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="Ej: Laptop Dell XPS 13"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                  Precio (CLP)
                </label>
                <input
                  id="price"
                  value={form.price}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^0-9]/g, '')
                    handleChange('price', value)
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="15000"
                />
                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="stock">
                  Stock
                </label>
                <input
                  id="stock"
                  value={form.stock}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^0-9]/g, '')
                    handleChange('stock', value)
                  }}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="0"
                />
                {errors.stock && <p className="text-sm text-red-600 mt-1">{errors.stock}</p>}
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => handleChange('isActive', event.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              Producto activo
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={formPending}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formPending ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}
