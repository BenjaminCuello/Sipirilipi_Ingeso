import 'dotenv/config'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import usersRouter from './routes/users'
import authRouter from './routes/auth'
import productsRouter from './routes/products'
import { prisma } from './lib/prisma'
import { errorHandler } from './middleware/error'

const app = express()

// middlewares base
app.use(express.json())
app.use(cookieParser())
app.use(helmet())

// cors configurable por env y con defaults utiles
// CORS_ORIGIN puede venir como lista separada por coma
const envOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean) ?? []
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174']
const originList = envOrigins.length > 0 ? envOrigins : defaultOrigins
const corsCredentials = process.env.CORS_CREDENTIALS === 'true' || true

app.use(
  cors({
    origin: originList,
    credentials: corsCredentials,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// endpoints de salud para compatibilidad
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }))
app.get('/api/health', (_req: Request, res: Response) => res.json({ ok: true }))

// rutas http
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)

// manejador de errores al final
app.use(errorHandler)

const PORT = Number(process.env.PORT ?? 4000)

// validaciones basicas de configuracion
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no esta configurada')
}
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET no esta configurada, endpoints de login fallaran')
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})

// cierre ordenado de prisma
const shutdown = async () => {
  try {
    await prisma.$disconnect()
  } finally {
    process.exit(0)
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
