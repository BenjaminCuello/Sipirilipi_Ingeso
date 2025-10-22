import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_SECONDS = Number(process.env.JWT_EXPIRES_SECONDS || 3600);
const COOKIE_NAME = process.env.COOKIE_NAME || 'access_token';
const isProd = process.env.NODE_ENV === 'production';

function signToken(u: { id: number; email: string; role: string }) {
  return jwt.sign({ sub: u.id, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_SECONDS });
}

function setCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: JWT_EXPIRES_SECONDS * 1000,
    path: '/',
  });
}

export async function register(req: Request, res: Response) {
  const { email, password, role = 'CUSTOMER' } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
    select: { id: true, email: true, role: true }
  });

  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  setCookie(res, token);
  res.setHeader('Authorization', `Bearer ${token}`);

  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    expiresIn: JWT_EXPIRES_SECONDS
  });
}

export async function me(req: Request, res: Response) {
  res.json({ me: (req as any).user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ message: 'Sesión cerrada' });
}