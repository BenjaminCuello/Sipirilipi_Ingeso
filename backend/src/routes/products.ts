import { Router } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const productSelect = {
  id: true,
  name: true,
  price_cents: true,
  stock: true,
  is_active: true,
  createdAt: true,
  updatedAt: true,
} as const;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const createProductSchema = z.object({
  name: z.string().trim().min(1),
  price_cents: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  is_active: z.coerce.boolean().optional(),
});

const productIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// GET /api/products - publico con paginacion basica
router.get('/', async (req, res, next) => {
  try {
    const { page, limit } = querySchema.parse({
      page: req.query.page,
      limit: req.query.limit,
    });

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: { is_active: true },
        orderBy: { id: 'asc' },
        skip,
        take: limit,
        select: productSelect,
      }),
      prisma.product.count({ where: { is_active: true } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues });
    }
    next(err);
  }
});

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const parsed = createProductSchema.parse(req.body);
    const product = await prisma.product.create({
      data: {
        name: parsed.name,
        price_cents: parsed.price_cents,
        stock: parsed.stock,
        is_active: parsed.is_active ?? true,
      },
      select: productSelect,
    });

    res.status(201).json(product);
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues });
    }
    next(err);
  }
});

router.delete('/:id', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues });
    }
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    next(err);
  }
});

export default router;
