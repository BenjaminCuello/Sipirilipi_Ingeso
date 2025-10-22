import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

function parseBody(b: any) {
  const name = String(b?.name ?? '').trim();
  const price = Number(b?.price);
  const stock = Number.isFinite(Number(b?.stock)) ? Number(b.stock) : 0;
  const isActive = Boolean(b?.is_active ?? b?.isActive);
  if (!name) throw new Error('El nombre es requerido');
  if (!Number.isFinite(price) || price < 0) throw new Error('Precio inválido');
  if (!Number.isInteger(stock) || stock < 0) throw new Error('Stock inválido');
  return { name, price, stock, isActive };
}

export async function list(_req: Request, res: Response) {
  const items = await prisma.product.findMany({
    orderBy: { id: 'desc' },
    select: { id: true, name: true, price: true, stock: true, isActive: true },
  });
  res.json(items);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const item = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true, price: true, stock: true, isActive: true },
  });
  if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(item);
}

export async function create(req: Request, res: Response) {
  try {
    const { name, price, stock, isActive } = parseBody(req.body);
    const created = await prisma.product.create({
      data: { name, price, stock, isActive },
      select: { id: true, name: true, price: true, stock: true, isActive: true },
    });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? 'Datos inválidos' });
  }
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: 'Producto no encontrado' });
    const { name, price, stock, isActive } = parseBody(req.body);
    const updated = await prisma.product.update({
      where: { id },
      data: { name, price, stock, isActive },
      select: { id: true, name: true, price: true, stock: true, isActive: true },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? 'Datos inválidos' });
  }
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: 'Producto no encontrado' });
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? 'Error al eliminar producto' });
  }
}