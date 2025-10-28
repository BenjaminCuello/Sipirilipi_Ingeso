import { createBrowserRouter } from 'react-router-dom'
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
import RecoverPasswordPage from './pages/RecoverPasswordPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
  { path: '/', element: <PublicCatalogPage /> },
  { path: '/cart', element: <CartPage /> },
  { path: '/carrito', element: <CartPage /> },
  { path: '/product/:id', element: <ProductDetailPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
      { path: '/recuperar', element: <RecoverPasswordPage /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/panel/products', element: <SellerProductsPage /> },
      { path: '/panel/products/new', element: <ProductFormPage /> },
      { path: '/panel/products/:id/edit', element: <ProductFormPage /> },
      { path: '/admin', element: <CatalogPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export default router
