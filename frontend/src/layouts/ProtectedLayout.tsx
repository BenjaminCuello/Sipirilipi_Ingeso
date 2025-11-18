import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated, hasRole } from "../lib/auth";

export default function ProtectedLayout() {
  const location = useLocation();
  const isPanelRoute = location.pathname.startsWith("/panel");

  // Check auth first
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check role for panel routes
  if (isPanelRoute && !hasRole("ADMIN", "SELLER")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
