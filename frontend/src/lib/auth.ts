// src/lib/auth.ts
export const isAuthenticated = () => Boolean(localStorage.getItem("token"));
export const login = () => localStorage.setItem("token", "demo-token");
export const logout = () => localStorage.removeItem("token");
