import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// GET /api/products — público con paginación básica
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

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
        select: {
          id: true,
          name: true,
          price_cents: true,
          stock: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
        },
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
      return res.status(400).json({ error: 'Parámetros inválidos', details: err.issues });
    }
    next(err);
  }
});

export default router;
