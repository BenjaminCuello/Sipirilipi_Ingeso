// src/lib/auth.ts

// tipos basicos
export type User = {
  id: number
  email: string
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER'
}

// claves de storage
export const TOKEN_KEY = 'token'
export const USER_KEY = 'user'

// helpers de lectura
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const isAuthenticated = () => Boolean(getToken())
export const getUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY)
  return data ? (JSON.parse(data) as User) : null
}

export const hasRole = (...roles: User['role'][]) => {
  const user = getUser()
  return user ? roles.includes(user.role) : false
}

export const login = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// logout simple
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
