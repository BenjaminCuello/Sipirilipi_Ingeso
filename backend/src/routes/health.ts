import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

const router = Router()

router.get('/health-db', async (_req, res) => {
    try {
        // Ejecuta una query ligera para verificar la conexión
        await prisma.$queryRaw`SELECT 1`

        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        logger.error({ err: error }, 'Healthcheck DB failed')
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        })
    }
})

export default router