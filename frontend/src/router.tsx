import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "./layouts/ProtectedLayout";
import PublicLayout from "./layouts/PublicLayout";
import CatalogPage from "./pages/CatalogPage";
import PublicCatalogPage from "./pages/PublicCatalogPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <PublicCatalogPage /> },
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: "/admin", element: <CatalogPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
