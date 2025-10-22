import { Router } from 'express';
import { list, getById, create, update, remove } from './products.controller';
import { authenticateJWT, requireRole } from '../../middlewares/auth';

export const productsRouter = Router();

// Rutas públicas
productsRouter.get('/', list);
productsRouter.get('/:id', getById);

// Rutas protegidas (requieren auth + rol)
productsRouter.post('/', authenticateJWT, requireRole('ADMIN', 'SELLER'), create);
productsRouter.put('/:id', authenticateJWT, requireRole('ADMIN', 'SELLER'), update);
productsRouter.delete('/:id', authenticateJWT, requireRole('ADMIN', 'SELLER'), remove);