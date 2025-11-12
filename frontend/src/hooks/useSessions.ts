import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Esquema Zod sin cambios
const UserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  role: z.string(),
});
type User = z.infer<typeof UserSchema>;

export async function getAuthMe(): Promise<User> {
  const base = (import.meta.env.VITE_API_URL || '').toString().replace(/\/$/, '');
  const res = await fetch(`${base}/auth/me`, {
    method: 'GET',
    credentials: 'include', // enviar cookies
    headers: { 'Accept': 'application/json' },
  });

  if (res.status === 401) {
    // 🟢 CORRECCIÓN 1: Línea eliminada.
    // Ya no se necesita "(err as any).status = 401;".
    // Simplemente lanzamos el error.
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || 'Error fetching /auth/me');
  }

  const json = await res.json();
  return UserSchema.parse(json);
}

export function useSession() {
  // 🟢 CORRECCIÓN 2: `useQuery` actualizado a la sintaxis de objeto (v4/v5)
  const { data, isLoading, isError } = useQuery<User, Error>({
    queryKey: ['auth-me'],
    queryFn: getAuthMe,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const user = data;
  return {
    user,
    role: user?.role,
    isAuthenticated: !!user,
    isLoading,
    isError, // 🟢 CORRECCIÓN 3: Este error desaparece al arreglar useQuery
  };
}

