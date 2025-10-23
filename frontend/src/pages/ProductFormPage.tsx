import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Product } from '../lib/api'
import { useToast } from '../lib/toast'

type ProductDraft = Pick<Product, 'name' | 'price' | 'stock' | 'isActive'>

function validate(fields: ProductDraft) {
  const errors: Record<string, string> = {}
  if (!fields.name.trim()) errors.name = 'El nombre es requerido'
  if (Number.isNaN(fields.price) || fields.price < 0) errors.price = 'Precio invalido'
  if (!Number.isInteger(fields.stock) || fields.stock < 0) errors.stock = 'Stock invalido'
  return errors
}

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<ProductDraft>({ name: '', price: 0, stock: 0, isActive: true })
  const [priceInput, setPriceInput] = useState('')
  const [stockInput, setStockInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isEdit || !id) return

    setLoading(true)
    api
      .getProduct(Number(id))
      .then((data) => {
        setProduct({ name: data.name, price: data.price, stock: data.stock, isActive: data.isActive })
        setPriceInput(String(data.price))
        setStockInput(String(data.stock))
      })
      .catch(() => toast.push('error', 'No se pudo cargar el producto'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const draft: ProductDraft = {
      name: product.name,
      price: Number(priceInput || 0),
      stock: Number(stockInput || 0),
      isActive: product.isActive,
    }

    const nextErrors = validate(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      setLoading(true)
      if (isEdit && id) {
        await api.updateProduct(Number(id), draft)
        toast.push('success', 'Producto actualizado')
      } else {
        await api.createProduct(draft)
        toast.push('success', 'Producto creado')
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/panel/products', { replace: true })
    } catch (err) {
      toast.push('error', err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-gray-50">
      <section className="container mx-auto p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/panel/products')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Editar' : 'Crear'} producto</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Nombre del producto
              </label>
              <input
                id="name"
                type="text"
                value={product.name}
                onChange={(event) => setProduct({ ...product, name: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="Ej: Laptop Dell XPS 13"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-900 mb-2">
                Precio (CLP)
              </label>
              <input
                id="price"
                type="text"
                inputMode="decimal"
                value={priceInput}
                onChange={(event) => {
                  let value = event.target.value.replace(/[^0-9.,]/g, '')
                  value = value.replace(',', '.')
                  const parts = value.split('.')
                  if (parts.length > 2) {
                    value = `${parts[0]}.${parts.slice(1).join('')}`
                  }
                  setPriceInput(value)
                  setProduct({ ...product, price: Number(value || 0) })
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="Ej: 15000"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-900 mb-2">
                Stock disponible
              </label>
              <input
                id="stock"
                type="text"
                inputMode="numeric"
                value={stockInput}
                onChange={(event) => {
                  const value = event.target.value.replace(/[^0-9]/g, '')
                  setStockInput(value)
                  setProduct({ ...product, stock: Number(value || 0) })
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="0"
              />
              {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                id="isActive"
                type="checkbox"
                checked={product.isActive}
                onChange={(event) => setProduct({ ...product, isActive: event.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Producto activo
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Guardando...' : 'Guardar producto'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/panel/products')}
              className="px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
