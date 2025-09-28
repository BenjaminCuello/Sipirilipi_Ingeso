import 'dotenv/config';
import express, { Request, Response } from 'express';
import { errorHandler } from './middleware/error';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import { prisma } from './lib/prisma';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Rutas
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

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
