import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, hasRole } from "../lib/auth";

export default function ProtectedLayout() {
  const location = useLocation();
  const path = location.pathname;
  const isPanelRoute = path.startsWith("/panel");
  const isAdminRoute = path.startsWith("/admin");

  // Check auth first
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check role for panel/admin routes
  if ((isPanelRoute || isAdminRoute) && !hasRole("ADMIN", "SELLER")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
