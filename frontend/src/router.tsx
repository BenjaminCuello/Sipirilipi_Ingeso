import { createBrowserRouter, Navigate, redirect } from 'react-router-dom';
import ProtectedLayout from './layouts/ProtectedLayout'; // <-- Lo usamos con props
import PublicLayout from './layouts/PublicLayout';
import CatalogPage from './pages/CatalogPage';
import PublicCatalogPage from './pages/PublicCatalogPage';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFormPage from './pages/ProductFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import SellerProductsPage from './pages/SellerProductsPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import RecoverPasswordPage from './pages/RecoverPasswordPage';
import SearchResultsPage from './pages/SearchResultsPage';

export const router = createBrowserRouter([
  {
    // --- BLOQUE PÚBLICO (Sin cambios) ---
    element: <PublicLayout />,
    children: [
      { path: '/', element: <PublicCatalogPage /> },
      { path: '/carrito', element: <CartPage /> },
      { path: '/cart', element: <Navigate to="/carrito" replace /> },
      { path: '/product/:id', loader: ({ params }) => redirect(`/producto/${params.id}`) },
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
      { path: '/recuperar', element: <RecoverPasswordPage /> },
      { path: '/buscar', element: <SearchResultsPage /> },
      { path: '/producto/:id', element: <ProductDetailPage /> },
    ],
  },
  {
    // --- 🟢 NUEVO: BLOQUE PROTEGIDO PARA 'vendedor' ---
    // Estas rutas SÓLO son para el rol 'vendedor'
    element: <ProtectedLayout allowedRoles={['vendedor']} />,
    children: [
      { path: '/panel/dashboard', element: <SellerDashboardPage /> },
      { path: '/panel/products', element: <SellerProductsPage /> },
      { path: '/panel/products/new', element: <ProductFormPage /> },
      { path: '/panel/products/:id/edit', element: <ProductFormPage /> },
    ],
  },
  {
    // --- 🟢 NUEVO: BLOQUE PROTEGIDO PARA 'admin' ---
    // Esta ruta SÓLO es para el rol 'admin'
    element: <ProtectedLayout allowedRoles={['admin']} />,
    children: [
      // (Asumiendo que 'vendedor' y 'admin' son roles distintos)
      // Si 'admin' también es 'vendedor', deberías usar ['admin', 'vendedor']
      // Pero por ahora, los separamos.
      { path: '/admin', element: <CatalogPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
