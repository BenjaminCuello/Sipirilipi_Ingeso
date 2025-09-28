import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/";

  const handleLogin = () => {
    login(); // guarda "token" (demo)
    navigate(from, { replace: true });
  };

  return (
    <main className="min-h-dvh grid place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900 text-center">Iniciar sesión</h1>
        {/* Aquí iría tu formulario real; por ahora un botón demo */}
        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 active:scale-95 transition"
        >
          Entrar (demo)
        </button>
      </div>
    </main>
  );
}

