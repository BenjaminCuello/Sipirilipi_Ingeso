import { Router } from 'express'
import { Role, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { requireAuth, requireRole } from '../middleware/auth'
import multer from 'multer'
import { upload } from '../middleware/upload'
import { processUploadedImage, removeImage } from '../services/image.service'

const router = Router()

const categorySelect = {
  id: true,
  name: true,
  slug: true,
} as const

const productImageSelect = {
  id: true,
  filename: true,
  original_url: true,
  thumb_url: true,
  position: true,
} as const

const productSelect = {
  id: true,
  name: true,
  brand: true,
  description: true,
  color: true,
  price_cents: true,
  stock: true,
  is_active: true,
  categoryId: true,
  category: { select: categorySelect },
  image_url: true,
  thumb_url: true,
  createdAt: true,
  updatedAt: true,
  images: { select: productImageSelect, orderBy: { position: 'asc' as const } },
} as const

const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    sortBy: z.enum(['id', 'name', 'price_cents', 'createdAt']).default('id'),
    order: z.enum(['asc', 'desc']).default('asc'),
    includeInactive: z.coerce.boolean().optional().default(false),
    q: z.string().trim().min(1).optional(),
    categoryId: z.coerce.number().int().min(1).optional(),
    categorySlug: z.string().trim().min(1).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    color: z.string().trim().min(1).optional(),
    brand: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    { message: 'minPrice no puede ser mayor que maxPrice', path: ['minPrice'] }
  )

const productBodySchema = z
  .object({
    name: z.string().trim().min(1),
    brand: z.string().trim().max(120).optional(),
    description: z.string().trim().max(4000).optional(),
    color: z.string().trim().max(60).optional(),
    stock: z.coerce.number().int().min(0),
    price: z.coerce.number().min(0).optional(),
    price_cents: z.coerce.number().int().min(0).optional(),
    isActive: z.coerce.boolean().optional(),
    is_active: z.coerce.boolean().optional(),
    categoryId: z.coerce.number().int().min(1).optional(),
    category_id: z.coerce.number().int().min(1).optional(),
    imageUrl: z.string().url().optional(),
    image_url: z.string().url().optional(),
    thumbUrl: z.string().url().optional(),
    thumb_url: z.string().url().optional(),
  })
  .refine(
    data => typeof data.price === 'number' || typeof data.price_cents === 'number',
    { message: 'Precio requerido', path: ['price'] }
  )

const productIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
})

const suggestionsQuerySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(10).default(5),
})

function mapProduct(product: Prisma.ProductGetPayload<{ select: typeof productSelect }>) {
  const images = (product as any).images ?? []
  const first = images[0] ?? null
  const computedImageUrl = (first ? first.original_url : null) ?? product.image_url
  const computedThumbUrl = (first ? first.thumb_url : null) ?? product.thumb_url
  return {
    id: product.id,
    name: product.name,
    brand: product.brand ?? null,
    description: product.description,
    color: product.color ?? null,
    price: product.price_cents,
    price_cents: product.price_cents,
    stock: product.stock,
    isActive: product.is_active,
    is_active: product.is_active,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    imageUrl: computedImageUrl,
    image_url: computedImageUrl,
    thumbUrl: computedThumbUrl,
    thumb_url: computedThumbUrl,
    images: images.map((img: any) => ({
      id: img.id,
      filename: img.filename,
      originalUrl: img.original_url,
      thumbUrl: img.thumb_url,
      position: img.position,
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

const imageUploader = upload.array('files', 10)
const MAX_IMAGES_PER_PRODUCT = 10

router.get('/', async (req, res, next) => {
  try {
    const parsed = listQuerySchema.parse({
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
      includeInactive: req.query.includeInactive,
      q: req.query.q,
      categoryId: req.query.categoryId,
      categorySlug: req.query.categorySlug,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      color: req.query.color,
      brand: req.query.brand,
    })

    const skip = (parsed.page - 1) * parsed.limit

    const where: Prisma.ProductWhereInput = parsed.includeInactive
      ? {}
      : { is_active: true }

    if (parsed.q) {
      where.name = { contains: parsed.q, mode: 'insensitive' }
    }

    if (parsed.categoryId) {
      where.categoryId = parsed.categoryId
    } else if (parsed.categorySlug) {
      where.category = { slug: parsed.categorySlug }
    }

    if (parsed.minPrice !== undefined || parsed.maxPrice !== undefined) {
      where.price_cents = {}
      if (parsed.minPrice !== undefined) {
        where.price_cents.gte = parsed.minPrice
      }
      if (parsed.maxPrice !== undefined) {
        where.price_cents.lte = parsed.maxPrice
      }
    }

    if (parsed.color) {
      where.color = { equals: parsed.color, mode: 'insensitive' }
    }

    if (parsed.brand) {
      where.brand = { equals: parsed.brand, mode: 'insensitive' }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [parsed.sortBy]: parsed.order,
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parsed.limit,
        select: productSelect,
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / parsed.limit))

    res.json({
      data: items.map(mapProduct),
      pagination: {
        page: parsed.page,
        limit: parsed.limit,
        total,
        totalPages,
      },
    })
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    next(err)
  }
})

router.get('/suggestions', async (req, res, next) => {
  try {
    const { q, limit } = suggestionsQuerySchema.parse({
      q: req.query.q,
      limit: req.query.limit,
    })

    const items = await prisma.product.findMany({
      where: {
        is_active: true,
        name: { contains: q, mode: 'insensitive' },
      },
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      select: productSelect,
    })

    res.json(items.map(mapProduct))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    next(err)
  }
})

router.get('/public/:id', async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params)
    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    })
    if (!product || !product.is_active) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(mapProduct(product))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    next(err)
  }
})

router.get('/:id', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params)
    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    })
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(mapProduct(product))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    next(err)
  }
})

router.post('/', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const parsed = productBodySchema.parse(req.body)
    const priceSource =
      typeof parsed.price_cents === 'number'
        ? parsed.price_cents
        : Math.round(parsed.price ?? 0)
    const priceCents = Math.max(0, priceSource)

    const categoryId = parsed.categoryId ?? (parsed as any).category_id ?? null
    const imageUrl = parsed.imageUrl ?? parsed.image_url ?? null
    const thumbUrl = parsed.thumbUrl ?? parsed.thumb_url ?? null

    const product = await prisma.product.create({
      data: {
        name: parsed.name,
        brand: parsed.brand ?? null,
        description: parsed.description ?? '',
        color: parsed.color ?? null,
        price_cents: priceCents,
        stock: parsed.stock,
        is_active: parsed.is_active ?? parsed.isActive ?? true,
        categoryId,
        image_url: imageUrl,
        thumb_url: thumbUrl,
      },
      select: productSelect,
    })

    res.status(201).json(mapProduct(product))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

router.put('/:id', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params)
    const parsed = productBodySchema.parse(req.body)
    const priceSource =
      typeof parsed.price_cents === 'number'
        ? parsed.price_cents
        : Math.round(parsed.price ?? 0)
    const priceCents = Math.max(0, priceSource)
    const categoryId = parsed.categoryId ?? (parsed as any).category_id ?? null
    const imageUrl = parsed.imageUrl ?? parsed.image_url ?? null
    const thumbUrl = parsed.thumbUrl ?? parsed.thumb_url ?? null

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: parsed.name,
        brand: parsed.brand ?? null,
        description: parsed.description ?? '',
        color: parsed.color ?? null,
        price_cents: priceCents,
        stock: parsed.stock,
        is_active: parsed.is_active ?? parsed.isActive ?? true,
        categoryId,
        image_url: imageUrl,
        thumb_url: thumbUrl,
      },
      select: productSelect,
    })

    res.json(mapProduct(product))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    next(err)
  }
})

router.delete('/:id', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params)
    await prisma.product.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    next(err)
  }
})

// Subida y gestion de imagenes del producto
const reorderBodySchema = z.object({
  order: z.array(z.number().int().min(1)).min(1),
})

router.post('/:id/images', requireAuth, requireRole(Role.ADMIN, Role.SELLER), (req, res, next) => {
  imageUploader(req, res, async err => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Archivo demasiado grande' })
        return res.status(400).json({ error: err.message })
      }
      return next(err)
    }

    try {
      const { id } = productIdParamSchema.parse(req.params)
      const files = (req.files as Express.Multer.File[]) ?? []
      if (files.length === 0) return res.status(400).json({ error: 'Debe subir al menos una imagen' })

      // validar producto
      const product = await prisma.product.findUnique({ where: { id }, select: { id: true } })
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' })

      const existingCount = await prisma.productImage.count({ where: { productId: id } })
      if (existingCount + files.length > MAX_IMAGES_PER_PRODUCT) {
        return res.status(400).json({ error: `Maximo ${MAX_IMAGES_PER_PRODUCT} imagenes por producto` })
      }

      const last = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { position: 'desc' },
        select: { position: true },
      })
      let basePos = last?.position ?? 0

      const processed = await Promise.all(files.map(f => processUploadedImage(f)))
      const created = await Promise.all(
        processed.map((p, idx) =>
          prisma.productImage.create({
            data: {
              productId: id,
              filename: p.filename,
              original_url: p.originalUrl,
              thumb_url: p.thumbUrl,
              width: p.width ?? null,
              height: p.height ?? null,
              mime: p.mime,
              size: p.size,
              position: basePos + idx + 1,
            },
            select: { id: true, filename: true, original_url: true, thumb_url: true, position: true },
          })
        )
      )

      res.status(201).json(
        created.map(c => ({
          id: c.id,
          filename: c.filename,
          originalUrl: c.original_url,
          thumbUrl: c.thumb_url,
          position: c.position,
        }))
      )
    } catch (e) {
      next(e)
    }
  })
})

router.delete('/:id/images/:imageId', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse({ id: req.params.id })
    const imageId = z.coerce.number().int().min(1).parse(req.params.imageId)

    const image = await prisma.productImage.findUnique({ where: { id: imageId } })
    if (!image || image.productId !== id) return res.status(404).json({ error: 'Imagen no encontrada' })

    await removeImage(image.filename).catch(() => undefined)
    await prisma.productImage.delete({ where: { id: imageId } })

    // compactar posiciones
    const remaining = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { position: 'asc' },
      select: { id: true },
    })
    await Promise.all(
      remaining.map((img, idx) => prisma.productImage.update({ where: { id: img.id }, data: { position: idx + 1 } }))
    )

    res.status(204).send()
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Parametros invalidos', details: err.issues })
    }
    next(err)
  }
})

router.patch('/:id/images/reorder', requireAuth, requireRole(Role.ADMIN, Role.SELLER), async (req, res, next) => {
  try {
    const { id } = productIdParamSchema.parse(req.params)
    const { order } = reorderBodySchema.parse(req.body)

    const images = await prisma.productImage.findMany({
      where: { productId: id },
      select: { id: true },
    })
    const ids = new Set(images.map(i => i.id))
    if (order.length !== images.length || order.some(i => !ids.has(i))) {
      return res.status(400).json({ error: 'Orden invalido' })
    }

    await Promise.all(order.map((imageId, idx) => prisma.productImage.update({ where: { id: imageId }, data: { position: idx + 1 } })))
    res.status(204).send()
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

export default router
