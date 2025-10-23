import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
})

const userIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
})

router.get('/', requireAuth, requireRole(Role.ADMIN), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { id: 'asc' },
    })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body)
    const password_hash = await bcrypt.hash(data.password, 10)
    const email = data.email.trim().toLowerCase()

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        password_hash,
        role: Role.CUSTOMER,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    res.status(201).json(user)
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ error: 'Email ya registrado' })
    }
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

router.put('/:id/role', requireAuth, requireRole(Role.ADMIN), async (req, res, next) => {
  try {
    const { id } = userIdParamSchema.parse(req.params)
    const { role } = updateRoleSchema.parse(req.body)

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    })

    res.json(user)
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    next(err)
  }
})

export default router
