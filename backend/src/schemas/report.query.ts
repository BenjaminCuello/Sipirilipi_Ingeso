import { z } from 'zod';

/**
 * Devuelve el string YYYY-MM para 11 meses atrás.
 */
const getDefaultForom = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 11); // 11 meses atrás (para un total de 12 meses)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Devuelve el string YYYY-MM para el mes actual.
 */
const getDefaultTo = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const YYYY_MM_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Valida ?from=YYYY-MM&to=YYYY-MM
 * Transforma los strings en objetos Date para el servicio.
 */
export const salesByMonthQuerySchema = z.object({
    from: z
        .string()
        .regex(YYYY_MM_REGEX, 'Formato "from" debe ser YYYY-MM')
        .default(getDefaultForom)
        .transform((dateStr) => new Date(`${dateStr}-01T00:00:00.000Z`)),
    to: z
        .string()
        .regex(YYYY_MM_REGEX, 'Formato "to" debe ser YYYY-MM')
        .default(getDefaultTo)
        .transform((dateStr) => {
            const [year, month] = dateStr.split('-').map(Number);
            // Creamos la fecha del *inicio* del *siguiente* mes.
            // Así, la consulta SQL puede ser < esta fecha.
            return new Date(Date.UTC(year, month, 1));
        }),
});

/**
 * Valida ?limit=5
 */
export const topProductsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(5),
});

/**
 * Valida ?threshold=5
 */
export const lowStockQuerySchema = z.object({
    threshold: z.coerce.number().int().min(0).default(10), // Un default razonable
});