import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthPayload } from '../middleware/auth'
import { cartItemAddSchema, cartItemUpdateSchema, cartItemIdParamSchema } from '../schemas/cart.schema'

const router = Router()

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price_cents: true,
          stock: true,
          is_active: true,
        },
      },
    },
    orderBy: { id: 'asc' as const },
  },
} as const

async function upsertCart(userId: number) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: cartInclude,
  })
}

async function getCart(userId: number) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  })
  if (existing) return existing
  return upsertCart(userId)
}

type CartWithItems = Awaited<ReturnType<typeof getCart>>

type CartResponseItem = {
  id: number
  productId: number
  quantity: number
  subtotal_cents: number
  product: {
    id: number
    name: string
    price_cents: number
    stock: number
    is_active: boolean
  }
}

type CartResponse = {
  id: number
  userId: number
  items: CartResponseItem[]
  totals: {
    totalItems: number
    totalCents: number
  }
  updatedAt: Date
}

function mapCart(cart: CartWithItems): CartResponse {
  const items: CartResponseItem[] = cart.items.map((item) => {
    const product = item.product
    const subtotal = item.quantity * product.price_cents
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      subtotal_cents: subtotal,
      product: {
        id: product.id,
        name: product.name,
        price_cents: product.price_cents,
        stock: product.stock,
        is_active: product.is_active,
      },
    }
  })

  const totals = items.reduce(
    (acc, item) => {
      acc.totalItems += item.quantity
      acc.totalCents += item.subtotal_cents
      return acc
    },
    { totalItems: 0, totalCents: 0 }
  )

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    totals,
    updatedAt: cart.updatedAt,
  }
}

router.use(requireAuth)

router.get('/', async (_req, res, next) => {
  try {
    const user = res.locals.user as AuthPayload
    const cart = await getCart(user.sub)
    res.json(mapCart(cart))
  } catch (err) {
    next(err)
  }
})

router.post('/items', async (req, res, next) => {
  try {
    const user = res.locals.user as AuthPayload
    const { productId, qty } = cartItemAddSchema.parse(req.body)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price_cents: true, stock: true, is_active: true },
    })
    if (!product || !product.is_active) {
      return res.status(404).json({ error: 'Producto no disponible' })
    }
    if (product.stock <= 0) {
      return res.status(409).json({ error: 'Sin stock disponible' })
    }

    const cart = await upsertCart(user.sub)

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      select: { id: true, quantity: true },
    })

    const nextQuantity = (existing?.quantity ?? 0) + qty
    if (nextQuantity > product.stock) {
      return res.status(409).json({ error: 'Stock insuficiente', available: product.stock })
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: qty },
      })
    }

    const updated = await getCart(user.sub)
    res.status(existing ? 200 : 201).json(mapCart(updated))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

router.patch('/items/:itemId', async (req, res, next) => {
  try {
    const user = res.locals.user as AuthPayload
    const { itemId } = cartItemIdParamSchema.parse(req.params)
    const { qty } = cartItemUpdateSchema.parse(req.body)

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: { select: { userId: true } },
        product: { select: { id: true, stock: true, is_active: true, price_cents: true } },
      },
    })

    if (!item || item.cart.userId !== user.sub) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }
    if (!item.product.is_active) {
      return res.status(409).json({ error: 'Producto no disponible' })
    }
    if (qty > item.product.stock) {
      return res.status(409).json({ error: 'Stock insuficiente', available: item.product.stock })
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: qty },
    })

    const updated = await getCart(user.sub)
    res.json(mapCart(updated))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

router.delete('/items/:itemId', async (req, res, next) => {
  try {
    const user = res.locals.user as AuthPayload
    const { itemId } = cartItemIdParamSchema.parse(req.params)

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: { select: { userId: true } } },
    })

    if (!item || item.cart.userId !== user.sub) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }

    await prisma.cartItem.delete({ where: { id: itemId } })

    const updated = await getCart(user.sub)
    res.json(mapCart(updated))
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos invalidos', details: err.issues })
    }
    next(err)
  }
})

export default router
