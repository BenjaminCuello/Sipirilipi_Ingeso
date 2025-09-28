import 'dotenv/config';
import express, { Request, Response } from 'express';
import { errorHandler } from './middleware/error';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import { prisma } from './lib/prisma';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
app.use(express.json());

// Seguridad básica: Helmet
app.use(helmet());

// CORS para frontend local
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Rutas
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Validación temprana de configuración necesaria
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está configurada. Configure su conexión a PostgreSQL.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET no está configurada. El endpoint de login fallará hasta definirla.');
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Cierre ordenado de Prisma
const shutdown = async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
