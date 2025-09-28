import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="min-h-dvh grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-slate-600">Página no encontrada.</p>
        <Link className="text-indigo-600 underline" to="/">Volver al inicio</Link>
      </div>
    </main>
  );
}

