import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import type { Product } from '../lib/api'
import { useToast } from '../lib/toast'
import ProductService from '@/services/ProductService'
import type { CatalogCategory } from '@/services/ProductService'
import ProductImagesService, { type ProductImage as GalleryImage } from '@/services/ProductImagesService'

const MAX_UPLOAD_HINT = (import.meta.env.VITE_MAX_UPLOAD_MB as string | undefined) ?? '5'
const MAX_IMAGES = 10

type ProductPayload = {
  name: string
  brand: string | null
  description: string
  color: string | null
  price: number
  stock: number
  isActive: boolean
  categoryId: number | null
  imageUrl: string | null
  thumbUrl: string | null
}

type DraftState = {
  name: string
  brand: string
  description: string
  color: string
  price: number
  stock: number
  isActive: boolean
  categoryId: string
  imageUrl: string
  thumbUrl: string
}

function validate(fields: ProductPayload) {
  const errors: Record<string, string> = {}
  if (!fields.name.trim()) errors.name = 'El nombre es requerido'
  if (Number.isNaN(fields.price) || fields.price < 0) errors.price = 'Precio invalido'
  if (!Number.isInteger(fields.stock) || fields.stock < 0) errors.stock = 'Stock invalido'
  if (!fields.description.trim()) errors.description = 'La descripcion es requerida'
  if (fields.imageUrl && !/^https?:\/\//i.test(fields.imageUrl)) {
    errors.imageUrl = 'URL de imagen invalida'
  }
  if (fields.thumbUrl && !/^https?:\/\//i.test(fields.thumbUrl)) {
    errors.thumbUrl = 'URL de miniatura invalida'
  }
  return errors
}

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [product, setProduct] = useState<DraftState>({
    name: '',
    brand: '',
    description: '',
    color: '',
    price: 0,
    stock: 0,
    isActive: true,
    categoryId: '',
    imageUrl: '',
    thumbUrl: '',
  })
  const [priceInput, setPriceInput] = useState('')
  const [stockInput, setStockInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  async function loadCategories() {
    try {
      setCategoriesLoading(true)
      const data = await ProductService.listCategories()
      setCategories(data)
    } catch (err) {
      toast.push('error', err instanceof Error ? err.message : 'No se pudieron cargar las categorias')
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (!isEdit || !id) return

    setLoading(true)
    api
      .getProduct(Number(id))
      .then((data) => {
        setProduct({
          name: data.name,
          brand: data.brand ?? '',
          description: data.description ?? '',
          color: data.color ?? '',
          price: data.price,
          stock: data.stock,
          isActive: data.isActive,
          categoryId: data.categoryId ? String(data.categoryId) : '',
          imageUrl: data.imageUrl ?? '',
          thumbUrl: data.thumbUrl ?? '',
        })
        setPriceInput(String(data.price))
        setStockInput(String(data.stock))
        setGallery(data.images ?? [])
      })
      .catch(() => toast.push('error', 'No se pudo cargar el producto'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  const categoryOptions = categories.slice().sort((a, b) => a.name.localeCompare(b.name))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const currentImageUrl = product.imageUrl.trim() ? product.imageUrl.trim() : null
    const currentThumbUrl = product.thumbUrl.trim() ? product.thumbUrl.trim() : null

    const finalImageUrl = currentImageUrl
    const finalThumbUrl = currentThumbUrl ?? finalImageUrl

    const payload: ProductPayload = {
      name: product.name,
      brand: product.brand.trim() ? product.brand.trim() : null,
      description: product.description,
      color: product.color.trim() ? product.color.trim() : null,
      price: Number(priceInput || 0),
      stock: Number(stockInput || 0),
      isActive: product.isActive,
      categoryId: product.categoryId ? Number(product.categoryId) : null,
      imageUrl: finalImageUrl,
      thumbUrl: finalThumbUrl,
    }

    const nextErrors = validate(payload)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const requestBody: Product = {
      name: payload.name,
      brand: payload.brand,
      description: payload.description,
      color: payload.color,
      price: payload.price,
      stock: payload.stock,
      isActive: payload.isActive,
      categoryId: payload.categoryId,
      imageUrl: payload.imageUrl ?? undefined,
      thumbUrl: payload.thumbUrl ?? undefined,
    }

    try {
      setLoading(true)
      let targetId: number
      if (isEdit && id) {
        const numericId = Number(id)
        await api.updateProduct(numericId, requestBody)
        targetId = numericId
        toast.push('success', 'Producto actualizado')
      } else {
        const created = await api.createProduct(requestBody)
        if (!created.id) throw new Error('No se recibio ID del producto')
        targetId = created.id
        toast.push('success', 'Producto creado')
      }

      // subir archivos pendientes a la galeria
      if (pendingFiles.length > 0) {
        const remainSlots = Math.max(0, MAX_IMAGES - gallery.length)
        const toUpload = pendingFiles.slice(0, remainSlots)
        if (toUpload.length > 0) {
          await ProductImagesService.upload(targetId, toUpload)
        }
        if (pendingFiles.length > remainSlots) {
          toast.push('error', `Se alcanzaron ${MAX_IMAGES} imagenes maximas, no se subieron ${pendingFiles.length - remainSlots}`)
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/panel/products', { replace: true })
    } catch (err) {
      toast.push('error', err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCategory() {
    const name = window.prompt('Nombre de la nueva categoria')
    if (!name || !name.trim()) return
    try {
      setCategoriesLoading(true)
      const category = await ProductService.createCategory(name.trim())
      setCategories((prev) => [...prev, category])
      setProduct((prev) => ({ ...prev, categoryId: String(category.id) }))
      toast.push('success', 'Categoria creada')
    } catch (err) {
      toast.push('error', err instanceof Error ? err.message : 'No se pudo crear la categoria')
    } finally {
      setCategoriesLoading(false)
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const fileArr = Array.from(files)
      if (isEdit && id) {
        // subir directo al producto existente
        let toSend = fileArr
        if (gallery.length + fileArr.length > MAX_IMAGES) {
          const available = MAX_IMAGES - gallery.length
          if (available <= 0) {
            toast.push('error', `Maximo ${MAX_IMAGES} imagenes por producto`)
            return
          }
          toSend = fileArr.slice(0, available)
          toast.push('error', `Solo se agregaron ${available} de ${fileArr.length}`)
        }
        const uploaded = await ProductImagesService.upload(Number(id), toSend)
        setGallery((prev) => [...prev, ...uploaded])
        toast.push('success', 'Imagenes subidas')
      } else {
        // producto nuevo: guardar en memoria para subir al guardar
        const total = pendingFiles.length + fileArr.length
        if (total > MAX_IMAGES) {
          const available = MAX_IMAGES - pendingFiles.length
          if (available <= 0) {
            toast.push('error', `Maximo ${MAX_IMAGES} imagenes por producto`)
            return
          }
          setPendingFiles((prev) => [...prev, ...fileArr.slice(0, available)])
          toast.push('error', `Solo se agregaron ${available} de ${fileArr.length}`)
        } else {
          setPendingFiles((prev) => [...prev, ...fileArr])
          toast.push('success', 'Imagenes agregadas')
        }
      }
    } catch (error) {
      toast.push('error', error instanceof Error ? error.message : 'No se pudo subir la imagen')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  async function handleRemoveExisting(image: GalleryImage) {
    if (!isEdit || !id) return
    try {
      await ProductImagesService.remove(Number(id), image.id)
      setGallery((prev) => prev.filter((it) => it.id !== image.id))
      toast.push('success', 'Imagen eliminada')
    } catch (error) {
      toast.push('error', error instanceof Error ? error.message : 'No se pudo eliminar la imagen')
    }
  }

  function handleRemovePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // no copy util necesario con galeria asociada

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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-8 space-y-6">
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
                placeholder="Ej: Laptop Orion 15"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-900 mb-1">
                  Marca
                </label>
                <input
                  id="brand"
                  type="text"
                  value={product.brand}
                  onChange={(event) => setProduct({ ...product, brand: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="Ej: Orion"
                />
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-900 mb-1">
                  Color
                </label>
                <input
                  id="color"
                  type="text"
                  value={product.color}
                  onChange={(event) => setProduct({ ...product, color: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                  placeholder="Ej: Negro"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
                Descripcion
              </label>
              <textarea
                id="description"
                value={product.description}
                onChange={(event) => setProduct({ ...product, description: event.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="Describe las principales caracteristicas del producto"
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-900 mb-1">
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
                  placeholder="Ej: 150000"
                />
                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-900 mb-1">
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
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-900 mb-1">
                  Categoria
                </label>
                <select
                  id="categoryId"
                  value={product.categoryId}
                  onChange={(event) => setProduct({ ...product, categoryId: event.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-300 px-4 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                >
                  <option value="">Sin categoria</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={categoriesLoading}
                  className="h-11 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {categoriesLoading ? 'Creando...' : 'Nueva categoria'}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              <span className="block text-sm font-medium text-gray-900">Imagenes</span>
              <p className="text-xs text-gray-500">
                Formatos aceptados: JPG, PNG, WEBP. Tamano maximo {MAX_UPLOAD_HINT} MB por archivo. Maximo {MAX_IMAGES} imagenes por producto.
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleUpload}
                disabled={isUploading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
              />
              {isUploading && <p className="text-sm text-gray-500">Subiendo imagen...</p>}

              {/* Galeria existente (modo edicion) */}
              {isEdit && gallery.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {gallery.map((img) => (
                    <div key={img.id} className="rounded-lg border border-gray-200 p-3 flex gap-3">
                      <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                        <img src={img.thumbUrl} alt={img.filename} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{img.filename}</p>
                        <p className="text-xs text-gray-500">posicion {img.position}</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveExisting(img)}
                            className="text-xs px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Archivos pendientes (modo crear) */}
              {!isEdit && pendingFiles.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {pendingFiles.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="rounded-lg border border-gray-200 p-3 flex gap-3">
                      <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{file.name}</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRemovePending(idx)}
                            className="text-xs px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

          <div className="flex gap-3 pt-4 border-t">
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
