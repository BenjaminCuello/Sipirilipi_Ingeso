import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

export default function PublicLayout() {
  const location = useLocation();
  // si ya está logueado, evita ver /login
  if (isAuthenticated()) {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }
  return <Outlet />;
}

