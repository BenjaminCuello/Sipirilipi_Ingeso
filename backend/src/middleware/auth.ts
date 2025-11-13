import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
// 🟢 1. CORRECCIÓN: Se elimina la importación de 'Role'
// import { Role } from '@prisma/client'

// 🟢 2. CORRECCIÓN: Definimos el tipo 'Role' manualmente
export type Role = "ADMIN" | "SELLER" | "CUSTOMER";

export type AuthPayload = {
    sub: number
    role: Role
    iat?: number
    exp?: number
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        return res.status(500).json({ error: 'Falta configuracion del servidor' })
    }

    const header = req.header('Authorization') ?? ''
    const match = header.match(/^Bearer\s+(.+)$/i)
    if (!match) {
        return res.status(401).json({ error: 'Autorizacion requerida' })
    }

    const token = match[1]

    try {
        const decoded = jwt.verify(token, secret)
        if (typeof decoded !== 'object' || decoded === null) {
            return res.status(401).json({ error: 'Token invalido', code: 'invalid_token' })
        }
        const { sub, role, iat, exp } = decoded as JwtPayload
        if (typeof sub !== 'number' || typeof role !== 'string') {
            return res.status(401).json({ error: 'Token invalido', code: 'invalid_token' })
        }

        const payload: AuthPayload = {
            sub,
            role: role as Role,
            iat: typeof iat === 'number' ? iat : undefined,
            exp: typeof exp === 'number' ? exp : undefined,
        }

        res.locals.user = payload
        return next()
    } catch (jwtError: any) {
        if (jwtError?.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Sesion expirada', code: 'token_expired' })
        }
        if (jwtError?.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token invalido', code: 'invalid_token' })
        }
        return res.status(401).json({ error: 'Error de autenticacion', code: 'auth_error' })
    }
}

export function requireRole(...roles: Role[]) {
    return (_req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user as AuthPayload | undefined
        if (!user) {
            return res.status(401).json({ error: 'Autorizacion requerida' })
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ error: 'Prohibido' })
        }
        return next()
    }
}