// src/lib/auth.ts
type User = {
  id: number;
  email: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
};

export const getUser = (): User | null => {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = () => Boolean(localStorage.getItem("token"));

export const hasRole = (...roles: User["role"][]) => {
  const user = getUser();
  return user ? roles.includes(user.role) : false;
};

// Demo login como vendedor (local)
export const login = () => {
  localStorage.setItem("token", "demo-token");
  localStorage.setItem("user", JSON.stringify({
    id: 1,
    email: "vendedor@demo.com",
    role: "SELLER"
  }));
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
