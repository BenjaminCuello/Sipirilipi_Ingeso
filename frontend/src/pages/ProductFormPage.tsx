import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import type { Product } from '../lib/api';
import { useToast } from '../lib/toast';

function validate(p: Product) {
  const errors: Record<string, string> = {};
  if (!p.name.trim()) errors.name = 'El nombre es requerido';
  if (!Number.isFinite(Number(p.price)) || p.price < 0) errors.price = 'Precio inválido';
  if (!Number.isInteger(Number(p.stock)) || p.stock < 0) errors.stock = 'Stock inválido';
  return errors;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product>({ name: '', price: 0, stock: 0, isActive: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      api.getProduct(Number(id))
        .then((p) => setProduct(p))
        .catch(() => toast.push('error', 'No se pudo cargar el producto'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(product);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      setLoading(true);
      if (isEdit && id) {
        await api.updateProduct(Number(id), product);
        toast.push('success', 'Producto actualizado');
      } else {
        await api.createProduct(product);
        toast.push('success', 'Producto creado');
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.push('error', err?.message ?? 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-slate-50">
      <section className="container mx-auto p-6">
        <h1 className="text-xl font-bold mb-4">{isEdit ? 'Editar' : 'Crear'} producto</h1>
        <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded-lg shadow">
          <label className="block mb-3">
            <div className="text-sm font-medium">Nombre</div>
            <input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="mt-1 w-full rounded border p-2" />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </label>

          <label className="block mb-3">
            <div className="text-sm font-medium">Precio</div>
            <input type="number" step="0.01" value={product.price} onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })} className="mt-1 w-full rounded border p-2" />
            {errors.price && <div className="text-red-600 text-sm mt-1">{errors.price}</div>}
          </label>

          <label className="block mb-3">
            <div className="text-sm font-medium">Stock</div>
            <input type="number" value={product.stock} onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })} className="mt-1 w-full rounded border p-2" />
            {errors.stock && <div className="text-red-600 text-sm mt-1">{errors.stock}</div>}
          </label>

          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={product.isActive} onChange={(e) => setProduct({ ...product, isActive: e.target.checked })} />
            <span className="text-sm">Activo</span>
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded bg-indigo-600 text-white px-4 py-2">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="rounded border px-4 py-2">Cancelar</button>
          </div>
        </form>
      </section>
    </main>
  );
}
