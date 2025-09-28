import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "./layouts/ProtectedLayout";
import PublicLayout from "./layouts/PublicLayout";
import CatalogPage from "./pages/CatalogPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/", element: <CatalogPage /> }, // privada
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      { path: "/login", element: <LoginPage /> }, // pública
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
