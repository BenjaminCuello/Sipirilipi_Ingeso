import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../hooks/useSessions';
// 🟢 1. Importa el nuevo header
import DashboardHeader from '../components/dashboard/DashboardHeader';

interface ProtectedLayoutProps {
  allowedRoles?: string[];
}

export default function ProtectedLayout({ allowedRoles }: ProtectedLayoutProps) {
  const location = useLocation();
  const { user, role, isAuthenticated, isLoading, isError } = useSession();

  // --- 1. LÓGICA DE GUARDIA (Sin cambios) ---
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        Cargando...
      </div>
    );
  }

  if (isError || !isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  // --- 2. LAYOUT VISUAL (Con el header centralizado) ---
  return (
    // 🟢 2. Añadimos las clases de fondo aquí
    <div className="layout-privado min-h-dvh bg-gray-50">

      {/* 🟢 3. Renderizamos el header unificado */}
      <DashboardHeader />

      {/* 🟢 4. El <main> ahora solo envuelve el contenido de la página */}
      <main>
        {/* Renderiza la página hija (SellerDashboardPage, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}