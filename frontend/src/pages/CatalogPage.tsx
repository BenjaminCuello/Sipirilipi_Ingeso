import { logout, hasRole } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import type { Product } from "../lib/api";

export default function CatalogPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    api.listProducts().then((r) => setItems(r)).catch(() => setItems([]));
  }, []);

  return (
    <main className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Catálogo</h1>
            {hasRole("ADMIN", "SELLER") && (
              <button
                onClick={() => navigate("/panel/products")}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Ir al panel →
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100 active:scale-95 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="container mx-auto p-6">
        <p className="text-slate-600">Zona privada: aquí va tu catálogo 🔒</p>
        <div className="mt-6 flex items-center justify-between">
          <p className="text-slate-600">Productos: {items.length}</p>
          <div>
            <button onClick={() => navigate('/products/new')} className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700 transition">Nuevo producto</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <article key={p.id} className="rounded-2xl border p-4 bg-white shadow-sm">
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm text-slate-500">Precio: ${p.price}</p>
              <p className="text-sm text-slate-500">Stock: {p.stock}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => navigate(`/products/${p.id}/edit`)} className="rounded-lg border px-3 py-1.5 hover:bg-slate-100 transition">Editar</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
