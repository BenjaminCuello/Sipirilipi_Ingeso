import express, { Request, Response } from 'express';
import { errorHandler } from './middleware/error';
import usersRouter from './routes/users';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/api/users', usersRouter)

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});