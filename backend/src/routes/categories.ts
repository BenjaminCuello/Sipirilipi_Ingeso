import { Router } from 'express'
import { Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireRole } from '../middleware/auth'
import { slugify } from '../lib/slug'

const router = Router()

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
} as const

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
})

router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: categorySelect,
    })
    res.json(categories)
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { name } = createCategorySchema.parse(req.body)
    const slug = slugify(name)

    const exists = await prisma.category.findFirst({
      where: {
        OR: [
          { slug },
          { name: { equals: name, mode: 'insensitive' } },
        ],
      },
    })

    if (exists) {
      return res.status(409).json({ error: 'Categoria ya existe' })
    }

    const category = await prisma.category.create({
      data: { name, slug },
      select: categorySelect,
    })

    res.status(201).json(category)
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

export default router
