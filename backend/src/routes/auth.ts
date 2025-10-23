import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { loginLimiter } from '../middleware/rateLimiters'
import { requireAuth, AuthPayload } from '../middleware/auth'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const meResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.nativeEnum(Role),
})

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const normalizedEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, password_hash: true, role: true },
    })
    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales invalidas' })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({ error: 'Falta configuracion del servidor' })
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    } as jwt.SignOptions)

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

router.get('/me', requireAuth, async (_req, res, next) => {
  try {
    const payload = res.locals.user as AuthPayload
    const me = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true },
    })
    if (!me) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    return res.json(meResponseSchema.parse(me))
  } catch (err) {
    next(err)
  }
})

export default router
