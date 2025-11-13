import { createBrowserRouter, Navigate, redirect } from 'react-router-dom';

// Layouts
import ProtectedLayout from './layouts/ProtectedLayout';
import PublicLayout from './layouts/PublicLayout';

// Páginas Públicas
import PublicCatalogPage from './pages/PublicCatalogPage';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecoverPasswordPage from './pages/RecoverPasswordPage';
import SearchResultsPage from './pages/SearchResultsPage';
import NotFoundPage from './pages/NotFoundPage';

// Páginas de Panel (Protegidas)
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerProductsPage from './pages/SellerProductsPage';
import ProductFormPage from './pages/ProductFormPage';
import CatalogPage from './pages/CatalogPage'; // (Esta es la de Admin)

// 🟢 Nuevas Páginas de Tickets
import TicketsCustomerPage from './pages/TicketsCustomerPage';
import TicketsSellerPage from './pages/TicketsSellerPage';

export const router = createBrowserRouter([
  {
    // --- BLOQUE PÚBLICO ---
    element: <PublicLayout />,
    children: [
      { path: '/', element: <PublicCatalogPage /> },
      { path: '/carrito', element: <CartPage /> },
      // redirects por compatibilidad (Usa Navigate y redirect)
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
    // --- BLOQUE PROTEGIDO GENÉRICO (CLIENTE) ---
    element: <ProtectedLayout />, // Sin 'allowedRoles', solo requiere login
    children: [
      // 🟢 Ruta de tickets de cliente
      { path: '/account/tickets', element: <TicketsCustomerPage /> },
    ],
  },
  {
    // --- BLOQUE PROTEGIDO PARA 'vendedor' ---
    element: <ProtectedLayout allowedRoles={['vendedor']} />,
    children: [
      { path: '/panel/dashboard', element: <SellerDashboardPage /> },
      { path: '/panel/products', element: <SellerProductsPage /> },
      { path: '/panel/products/new', element: <ProductFormPage /> },
      { path: '/panel/products/:id/edit', element: <ProductFormPage /> },
      // 🟢 Ruta de tickets de vendedor
      { path: '/panel/tickets', element: <TicketsSellerPage /> },
    ],
  },
  {
    // --- BLOQUE PROTEGIDO PARA 'admin' ---
    element: <ProtectedLayout allowedRoles={['admin']} />,
    children: [
      { path: '/admin', element: <CatalogPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;