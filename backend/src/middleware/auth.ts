import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export type AuthPayload = {
  sub: number;
  role: Role;
  iat?: number;
  exp?: number;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Falta configuración del servidor' });
    }
    const header = req.header('Authorization') || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ error: 'Autorización requerida' });
    }
    const token = match[1];

    try {
        const decoded = jwt.verify(token, secret) as unknown as AuthPayload;
        res.locals.user = decoded;
        return next();
    } catch (jwtError : any) {
        if (jwtError.name === 'TokenExpireError'){
            return res.status(401).json({error: 'Sesion expirado', code: 'token_expired'});
        } else if (jwtError.name === 'JsonWebTokenError'){
            return res.status(401).json({error: 'Token invalido', code: 'invalid_token'});
        } else {
            return res.status(401).json({error: 'Error de autenficacion', code: 'auth_error'})
        }
    }
  } catch (_err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireRole(...roles: Role[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as AuthPayload | undefined;
    if (!user) return res.status(401).json({ error: 'Autorización requerida' });
    if (!roles.includes(user.role)) return res.status(403).json({ error: 'Prohibido' });
    return next();
  };
}

