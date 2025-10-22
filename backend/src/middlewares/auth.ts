import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = process.env.COOKIE_NAME || 'access_token';

export type JwtPayload = {
  sub: number;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  iat: number;
  exp: number;
};

function getToken(req: Request): string | null {
  const c = (req as any).cookies?.[COOKIE_NAME];
  if (c) return c;
  const h = req.headers.authorization;
  if (!h) return null;
  const [sch, t] = h.split(' ');
  return sch === 'Bearer' && t ? t : null;
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const decodedRaw = jwt.verify(token, JWT_SECRET);
    // jwt.verify can return string or object. Ensure we have an object payload
    if (typeof decodedRaw !== 'object' || decodedRaw === null) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    const decoded = decodedRaw as unknown as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireRole(...allowed: Array<JwtPayload['role']>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user as JwtPayload | undefined;
    if (!u) return res.status(401).json({ error: 'No autenticado' });
    if (!allowed.includes(u.role)) return res.status(403).json({ error: 'No autorizado' });
    next();
  };
}