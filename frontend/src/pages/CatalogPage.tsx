import { logout } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function CatalogPage() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Catálogo</h1>
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <article key={i} className="rounded-2xl border p-4 bg-white shadow-sm">
              <h2 className="font-semibold">Producto #{i + 1}</h2>
              <p className="text-sm text-slate-500">Descripción breve del producto.</p>
              <button className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 transition">
                Ver detalle
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
