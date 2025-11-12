import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSession } from '../../hooks/useSessions';

// -----------------------------------------------------------------
// 🟢 AQUÍ ESTÁ EL HOOK QUE FALTABA
// -----------------------------------------------------------------
function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutFn = async () => {
    const base = (import.meta.env.VITE_API_URL || '').toString().replace(/\/$/, '');
    const res = await fetch(`${base}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error al cerrar sesión');
    return res.json();
  };

  return useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      queryClient.setQueryData(['auth-me'], null);
      navigate('/login', { replace: true });
    },
    onError: (err: Error) => {
      console.error('Error en logout:', err);
      queryClient.setQueryData(['auth-me'], null);
      navigate('/login', { replace: true });
    },
  });
}
// -----------------------------------------------------------------

export default function DashboardHeader() {
  const logoutMutation = useLogout();
  const { role } = useSession();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `h-10 px-4 rounded-lg border transition text-sm font-medium flex items-center ${
      isActive
        ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              {role === 'vendedor' ? 'Panel de Vendedor' : 'Panel de Admin'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="h-10 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              Ir al inicio
            </Link>

            {/* Lógica de enlaces por rol */}
            {role === 'vendedor' && (
              <>
                <NavLink to="/panel/dashboard" className={getNavLinkClass} end>
                  Dashboard
                </NavLink>
                <NavLink to="/panel/products" className={getNavLinkClass}>
                  Productos
                </NavLink>
              </>
            )}

            {role === 'admin' && (
              <>
                <NavLink to="/admin" className={getNavLinkClass} end>
                  Gestionar Catálogo
                </NavLink>
              </>
            )}

            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="h-10 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Cerrar sesión'
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
