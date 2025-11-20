import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

export default function PublicLayout() {
  const location = useLocation();
  const state = (location.state as { from?: { pathname?: string } } | null) ?? null;
  // si ya está logueado, sólo evita ver /login
  if (isAuthenticated() && location.pathname === "/login") {
    const from = state?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }
  return <Outlet />;
}
