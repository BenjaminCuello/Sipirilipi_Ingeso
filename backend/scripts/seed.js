#!/usr/bin/env node
// create minimal demo data if missing
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  // user seed
  const email = 'cliente@demo.com'
  const password = 'secret12'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const password_hash = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { name: 'Cliente Demo', email, password_hash } })
    console.log('[seed] created demo user:', email)
  } else {
    console.log('[seed] demo user already exists:', email)
  }

  // products seed
  const count = await prisma.product.count({ where: { is_active: true } })
  if (count === 0) {
    const items = [
      { name: 'Mouse Logitech G203', price_cents: 19990, stock: 25 },
      { name: 'Teclado Redragon Kumara K552', price_cents: 24990, stock: 15 },
      { name: 'SSD NVMe 1TB PCIe 3.0', price_cents: 46990, stock: 8 },
      { name: 'Monitor 24" 75Hz IPS', price_cents: 99990, stock: 5 },
      { name: 'Auriculares JBL Tune 510BT', price_cents: 29990, stock: 12 },
      { name: 'Gabinete ATX vidrio templado', price_cents: 54990, stock: 7 },
      { name: 'Fuente 650W 80+ Bronze', price_cents: 48990, stock: 10 },
      { name: 'Placa Madre B550M', price_cents: 119990, stock: 6 },
      { name: 'Memoria RAM 16GB 3200MHz', price_cents: 39990, stock: 20 },
      { name: 'Router WiFi 6 AX1800', price_cents: 82990, stock: 4 },
      { name: 'GPU GTX 1660 Super', price_cents: 219990, stock: 3 },
      { name: 'Refrigeración líquida 240mm', price_cents: 89990, stock: 5 },
    ]
    await prisma.product.createMany({ data: items.map(p => ({ ...p, is_active: true })) })
    console.log('[seed] created demo products:', items.length)
  } else {
    console.log('[seed] products already present:', count)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})

