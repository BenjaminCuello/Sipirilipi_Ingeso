import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pinoHttp from 'pino-http' // <--- Nuevo import

import usersRouter from './routes/users'
import authRouter from './routes/auth'
import productsRouter from './routes/products'
import categoriesRouter from './routes/categories'
import mediaRouter from './routes/media'
import cartRouter from './routes/cart'
import checkoutRouter from './routes/checkout'
import ordersRouter from './routes/orders'
import ticketsRouter from './routes/tickets'
import healthRouter from './routes/health' // <--- Nuevo import
import { uploadsDir } from './middleware/upload'
import { prisma } from './lib/prisma'
import { errorHandler } from './middleware/error'
import { logger } from './lib/logger' // <--- Nuevo import

const app = express()

// Middleware de logging HTTP (antes de las rutas)
app.use(pinoHttp({ logger }))

// middlewares base
app.use(express.json())
app.use(cookieParser())
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
)

// CORS configurable por env
const envOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()).filter(Boolean) ?? []
const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174']
const originList = envOrigins.length > 0 ? envOrigins : defaultOrigins
const corsCredentials = process.env.CORS_CREDENTIALS === 'true'

app.use(
    cors({
        origin: originList,
        credentials: corsCredentials,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
)

// Rutas
app.use('/api', healthRouter) // <--- Montar healthcheck
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true })) // Legacy simple

// rutas http de negocio
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/media', mediaRouter)
app.use('/api/cart', cartRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/tickets', ticketsRouter)

app.use(
    '/uploads',
    express.static(uploadsDir, {
        setHeaders: res => {
            res.setHeader('Cache-Control', 'public, max-age=604800')
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        },
    })
)

// manejador de errores
const fallbackErrorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, 'Fallback error handler') // <--- Reemplazo console.error
    res.status(500).json({ error: 'Error interno' })
}
app.use(typeof errorHandler === 'function' ? errorHandler : fallbackErrorHandler)

const PORT = Number(process.env.PORT ?? 4000)

// Validaciones de entorno
if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL no esta configurada') // <--- Reemplazo
}
if (!process.env.JWT_SECRET) {
    logger.warn('JWT_SECRET no esta configurada, endpoints de login fallaran') // <--- Reemplazo
}

const server = app.listen(PORT, () => {
    logger.info(`API listening on http://localhost:${PORT}`) // <--- Reemplazo
})

// Cierre ordenado
const shutdown = async () => {
    logger.info('Shutting down server...')
    server.close(async () => {
        try {
            await prisma.$disconnect()
            logger.info('Prisma disconnected')
            process.exit(0)
        } catch (err) {
            logger.error({ err }, 'Error disconnecting Prisma')
            process.exit(1)
        }
    })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)