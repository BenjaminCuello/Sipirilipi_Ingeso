import { Router } from 'express';
import { reportService } from '../services/report.service';
import {
    salesByMonthQuerySchema,
    topProductsQuerySchema,
    lowStockQuerySchema,
} from '../schemas/report.query';

// 🟢 CORRECCIÓN:
// Importamos 'requireAuth' y 'requireRole' desde el archivo 'auth.ts'
// que está dentro de la carpeta 'middleware'
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// 🔒 Aplicamos autenticación a TODAS las rutas de este archivo
router.use(requireAuth, requireRole('ADMIN', 'SELLER'));

/**
 * GET /api/reports/sales-by-month?from=YYYY-MM&to=YYYY-MM
 */
router.get('/sales-by-month', async (req, res, next) => {
    try {
        // 1. Validar y transformar query params
        const { from, to } = salesByMonthQuerySchema.parse(req.query);

        // 2. Llamar al servicio
        const data = await reportService.getSalesByMonth(from, to);

        // 3. Responder
        res.json(data);
    } catch (error) {
        next(error); // Pasa el error de Zod o de Prisma al manejador de errores
    }
});

/**
 * GET /api/reports/top-products?limit=5
 */
router.get('/top-products', async (req, res, next) => {
    try {
        const { limit } = topProductsQuerySchema.parse(req.query);
        const data = await reportService.getTopProducts(limit);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/reports/low-stock?threshold=10
 */
router.get('/low-stock', async (req, res, next) => {
    try {
        const { threshold } = lowStockQuerySchema.parse(req.query);
        const data = await reportService.getLowStock(threshold);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

export default router;