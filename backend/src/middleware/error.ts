import { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger'; // <--- Importar logger

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    // Reemplazo de console.error(err) por logger
    logger.error({ err }, 'Unhandled Error')

    const status = err?.status ?? 500;
    res.status(status).json({ error: err?.message ?? 'Internal Server Error' });
}