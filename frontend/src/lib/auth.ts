// src/lib/auth.ts
const TOKEN_KEY = "token";
export const isAuthenticated = () => Boolean(localStorage.getItem(TOKEN_KEY));
export const login = () => localStorage.setItem(TOKEN_KEY, "demo-token");
export const logout = () => localStorage.removeItem(TOKEN_KEY);
export { TOKEN_KEY };
