import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRouter from './routes/auth'
import usersRouter from './routes/users'
import productsRouter from './routes/products'
import cartRouter from './routes/cart' // <-- del PR
import { prisma } from './lib/prisma'
import { errorHandler as customErrorHandler } from './middleware/error'

const app = express()

// Middlewares base
app.use(express.json())
app.use(cookieParser())
app.use(helmet())

// CORS configurable por .env, fallback a localhost:5173/5174
const envOrigins =
  process.env.CORS_ORIGIN?.split(',').map((o: string) => o.trim()).filter(Boolean) ?? []
const originList = envOrigins.length > 0 ? envOrigins : [
  'http://localhost:5173',
  'http://localhost:5174',
]
const corsCredentials = process.env.CORS_CREDENTIALS === 'true'

app.use(cors({
  origin: originList,
  credentials: corsCredentials,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Endpoints de salud
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }))
app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }))

// Rutas HTTP
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter) // <-- del PR

// Manejador de errores
// Preferimos el custom; si por algún motivo no está, usamos un fallback simple.
const fallbackErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno' })
}
app.use(typeof customErrorHandler === 'function' ? customErrorHandler : fallbackErrorHandler)

const PORT = Number(process.env.PORT ?? 4000)

// Validaciones básicas de config (no bloquean el arranque)
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está configurada')
}
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET no está configurada; endpoints de login podrían fallar')
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})

// Cierre ordenado de Prisma
const shutdown = async () => {
  try {
    await prisma.$disconnect()
  } finally {
    process.exit(0)
  }
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
