import "./index.css";

export default function App() {
  return (
    <main className="min-h-dvh grid place-items-center bg-slate-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-indigo-600">Tailwind OK</h1>
        <p className="text-slate-600">Vite + React + Tailwind v4</p>
        <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition">
          Botón Tailwind
        </button>
      </div>
    </main>
  );
}

