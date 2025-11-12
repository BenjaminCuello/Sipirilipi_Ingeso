import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../hooks/useSessions';
// 🟢 1. Importa el Header que ya modificamos
import { Header } from '../components/common/Header';
// import Footer from '../components/common/Footer'; // (Puedes descomentar esto si tienes un Footer)

// 🟢 2. Definimos un tipo para el location.state (Esto soluciona el error de 'any')
interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function PublicLayout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSession();

  // --- 1. LÓGICA DE GUARDIA (Redirigir si está logueado) ---
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/registro';

  if (isAuthenticated && isAuthPage) {
    if (isLoading) return null;

    // 🟢 3. Usamos el tipo LocationState (Arregla el error de la línea 22)
    const state = location.state as LocationState | null;
    const from = state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // --- 2. LAYOUT VISUAL ---
  // 🟢 4. ESTA ES LA PARTE IMPORTANTE que faltaba
  // Ahora este componente renderiza el Header y el resto de la página.
  return (
    <div className="layout-publico">

      {/* Renderiza el Header que ya tiene la lógica de roles */}
      <Header />

      <main>
        {/* Renderiza la página hija (ej. PublicCatalogPage, LoginPage) */}
        <Outlet />
      </main>

      {/* <Footer /> */}
    </div>
  );
}