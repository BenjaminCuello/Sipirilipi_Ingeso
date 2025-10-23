import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import type { Product } from '../lib/api';
import { useToast } from '../lib/toast';

function validate(p: Product) {
  const errors: Record<string, string> = {};
  if (!p.name.trim()) errors.name = 'El nombre es requerido';
  
  const price = Number(String(p.price).replace(',', '.'));
  if (isNaN(price) || price < 0) errors.price = 'Precio inválido';
  
  const stock = Number(p.stock);
  if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock inválido';
  
  return errors;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product>({ name: '', price: 0, stock: 0, isActive: true });
  const [priceInput, setPriceInput] = useState('');
  const [stockInput, setStockInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      api.getProduct(Number(id))
        .then((p) => {
          setProduct(p);
          // Formatear el precio con 2 decimales si tiene decimales, sino sin decimales
          const priceStr = p.price % 1 === 0 ? String(p.price) : p.price.toFixed(2);
          setPriceInput(priceStr);
          setStockInput(String(p.stock));
        })
        .catch(() => toast.push('error', 'No se pudo cargar el producto'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    console.log('=== DEBUG: Iniciando envío ===');
    console.log('Product state:', product);
    console.log('PriceInput:', priceInput);
    console.log('StockInput:', stockInput);
    
    const errs = validate(product);
    setErrors(errs);
    if (Object.keys(errs).length) {
      console.log('Errores de validación:', errs);
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar datos normalizando decimales
      const productToSave = {
        name: product.name,
        price: parseFloat(priceInput.replace(',', '.')) || 0,
        stock: parseInt(stockInput) || 0,
        isActive: product.isActive
      };
      
      console.log('=== Producto a enviar:', productToSave);
      
      if (isEdit && id) {
        const result = await api.updateProduct(Number(id), productToSave);
        console.log('Producto actualizado:', result);
        toast.push('success', 'Producto actualizado');
      } else {
        const result = await api.createProduct(productToSave);
        console.log('=== Producto creado con éxito:', result);
        toast.push('success', 'Producto creado');
      }
      
      // Forzar recarga de la página para que React Query actualice los datos
      window.location.href = '/panel/products';
    } catch (err) {
      console.error('=== ERROR al guardar producto:', err);
      console.error('Tipo de error:', typeof err);
      console.error('Stack:', err instanceof Error ? err.stack : 'N/A');
      toast.push('error', err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
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
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{isEdit ? 'Editar' : 'Crear'} producto</h1>
          </div>
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
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors"
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
                onChange={(e) => {
                  let value = e.target.value;
                  // Permitir números, punto y coma
                  value = value.replace(/[^0-9.,]/g, '');
                  // Convertir coma a punto
                  value = value.replace(',', '.');
                  // Solo permitir un punto decimal
                  const parts = value.split('.');
                  if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                  }
                  setPriceInput(value);
                  setProduct({ ...product, price: Number(value) || 0 });
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors"
                placeholder="Ej: 15000 o 15000.50"
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
                pattern="[0-9]*"
                value={stockInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setStockInput(value);
                  setProduct({ ...product, stock: Number(value) || 0 });
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-colors"
                placeholder="0"
              />
              {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock}</p>}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                id="isActive"
                type="checkbox"
                checked={product.isActive}
                onChange={(e) => setProduct({ ...product, isActive: e.target.checked })}
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
  );
}
