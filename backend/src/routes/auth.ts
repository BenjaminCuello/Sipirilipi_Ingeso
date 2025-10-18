import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { loginLimiter } from '../middleware/rateLimiters';
import {requireAuth} from "../middleware/auth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Falta configuración del servidor' });
    }

      const token = jwt.sign(
          { sub: user.id, role: user.role as Role },
          secret,
          { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: 'Datos inválidos', details: err.issues });
    }
    next(err);
  }
});
router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const userId = res.locals.user.sub;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    }catch (err){
        next(err);
    }
});

export default router;
