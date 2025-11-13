import { NextFunction, Request, Response } from 'express';
// 🟢 1. CORRECCIÓN: Se importa 'ZodType' en lugar de 'AnyZodObject'
import { z, ZodType } from 'zod';

/**
 * Middleware para validar esquemas Zod.
 * Captura errores y los pasa al errorHandler.
 */
export const validate =
    // 🟢 2. CORRECCIÓN: Se usa 'ZodType'
    (schema: ZodType) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                return next();
            } catch (error) {
                // Pasa el error de validación al errorHandler
                return next(error);
            }
        };