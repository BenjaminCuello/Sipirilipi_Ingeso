import { prisma } from '../lib/prisma'; // (Ajusta esta ruta si es necesario)

// --- 1. Reporte de Ventas por Mes ---
export type SalesByMonthResult = {
    month: Date;
    total: bigint;
};

// 🟢 Tipos definidos para los resultados de Prisma
type AggregatedItem = {
    productId: number;
    _sum: {
        quantity: number | null;
    };
};
type SimpleProduct = {
    id: number;
    name: string;
};

async function getSalesByMonth(from: Date, to: Date) {
    const result = await prisma.$queryRaw<SalesByMonthResult[]>`
    SELECT 
      date_trunc('month', "createdAt") AS month, 
      SUM("totalCents") AS total
    FROM "Order"
    WHERE status = 'paid'
      AND "createdAt" >= ${from}
      AND "createdAt" < ${to}
    GROUP BY 1
    ORDER BY 1 ASC;
  `;

    // 🟢 CORRECCIÓN (Línea 25): Se añadió el tipo 'SalesByMonthResult' a 'r'
    return result.map((r: SalesByMonthResult) => ({
        month: r.month.toISOString().substring(0, 7),
        total: r.total.toString(),
    }));
}

// --- 2. Reporte de Top Productos ---
async function getTopProducts(limit: number) {
    const aggregatedItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true,
        },
        orderBy: {
            _sum: {
                quantity: 'desc',
            },
        },
        take: limit,
    });

    const productIds = aggregatedItems.map((item: AggregatedItem) => item.productId); // 🟢 CORRECCIÓN (Línea 48)

    const products = await prisma.product.findMany({
        where: {
            id: { in: productIds },
        },
        select: {
            id: true,
            name: true,
        },
    });

    // 🟢 CORRECCIÓN (Línea 61 y 62): Se añadieron los tipos a 'item' y 'p'
    return aggregatedItems.map((item: AggregatedItem) => {
        const product = products.find((p: SimpleProduct) => p.id === item.productId);
        return {
            productId: item.productId,
            name: product?.name || 'Producto Desconocido',
            totalQuantity: item._sum.quantity || 0,
        };
    });
}

// --- 3. Reporte de Stock Bajo ---
async function getLowStock(threshold: number) {
    return prisma.product.findMany({
        where: {
            stock: {
                lt: threshold,
            },
        },
        select: {
            id: true,
            name: true,
            stock: true,
        },
        orderBy: {
            stock: 'asc',
        },
    });
}

export const reportService = {
    getSalesByMonth,
    getTopProducts,
    getLowStock,
};