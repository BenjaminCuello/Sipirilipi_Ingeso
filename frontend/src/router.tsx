import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedLayout from './layouts/ProtectedLayout'
import PublicLayout from './layouts/PublicLayout'
import CatalogPage from './pages/CatalogPage'
import PublicCatalogPage from './pages/PublicCatalogPage'
import CartPage from './pages/CartPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductFormPage from './pages/ProductFormPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import SellerProductsPage from './pages/SellerProductsPage'
import SellerDashboardPage from './pages/SellerDashboardPage'
import RecoverPasswordPage from './pages/RecoverPasswordPage'
import SearchResultsPage from './pages/SearchResultsPage'
import OrdersPage from './pages/OrdersPage'
import CheckoutPage from './pages/CheckoutPage'; 
import CheckoutSuccessPage from './pages/CheckoutSuccessPage'; 


export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
  { path: '/', element: <PublicCatalogPage /> },
  { path: '/carrito', element: <CartPage /> },
  // redirects por compatibilidad
  { path: '/cart', element: <Navigate to="/carrito" replace /> },
  { path: '/product/:id', element: <Navigate to="/producto/:id" replace /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
      { path: '/recuperar', element: <RecoverPasswordPage /> },
      { path: '/buscar', element: <SearchResultsPage /> },
      { path: '/producto/:id', element: <ProductDetailPage /> },
      { path: '/checkout/success', element: <CheckoutSuccessPage /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/panel/dashboard', element: <SellerDashboardPage /> },
      { path: '/panel/products', element: <SellerProductsPage /> },
      { path: '/panel/products/new', element: <ProductFormPage /> },
      { path: '/panel/products/:id/edit', element: <ProductFormPage /> },
      { path: '/admin', element: <CatalogPage /> },
      { path: '/account/orders', element: <OrdersPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export default router
