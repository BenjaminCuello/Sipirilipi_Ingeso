import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const unsplash = (size: string, terms: string) => `https://source.unsplash.com/${size}/?${terms}`

async function seedUsers() {
  const users = [
    { email: 'admin@tienda.com', name: 'Admin Demo', password: 'admin123', role: Role.ADMIN },
    { email: 'vendedor@tienda.com', name: 'Vendedor Demo', password: 'password123', role: Role.SELLER },
    { email: 'cliente@demo.com', name: 'Cliente Demo', password: 'secret12', role: Role.CUSTOMER },
    { email: 'cliente2@demo.com', name: 'Cliente Demo 2', password: 'secret12', role: Role.CUSTOMER },
    { email: 'cliente3@demo.com', name: 'Cliente Demo 3', password: 'secret12', role: Role.CUSTOMER },
    { email: 'cliente4@demo.com', name: 'Cliente Demo 4', password: 'secret12', role: Role.CUSTOMER },
  ]

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10)
    await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role },
      create: {
        name: user.name,
        email: user.email,
        password_hash: passwordHash,
        role: user.role,
      },
    })
  }
}

async function seedCatalog() {
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const categories = [
    'Notebooks Gamer',
    'Ultrabooks',
    'Tarjetas Graficas',
    'Almacenamiento',
    'Perifericos',
    'Networking',
    'Refrigeracion',
    'Monitores',
  ]

  const categoryMap = new Map<string, number>()
  for (const name of categories) {
    const slug = slugify(name)
    const category = await prisma.category.create({
      data: { name, slug },
      select: { id: true },
    })
    categoryMap.set(slug, category.id)
  }

  const products = [
    {
      name: 'Laptop Orion 15 Ryzen 7',
      brand: 'Orion',
      description: 'Notebook gamer de 15" con Ryzen 7 7840HS, 16GB RAM DDR5, SSD 1TB y RTX 4060.',
      color: 'Negro',
      price_cents: 1099990,
      stock: 6,
      category: 'Notebooks Gamer',
      image_url: unsplash('800x600', 'laptop,gaming,keyboard'),
      thumb_url: unsplash('400x300', 'laptop,gaming,keyboard'),
    },
    {
      name: 'Laptop Nova Creator 16 OLED',
      brand: 'Nova',
      description: 'Pantalla OLED 16", Intel i9 14900H, 32GB RAM y RTX 4070 ideal para produccion multimedia.',
      color: 'Gris oscuro',
      price_cents: 1499990,
      stock: 3,
      category: 'Notebooks Gamer',
      image_url: unsplash('800x600', 'laptop,oled,creative'),
      thumb_url: unsplash('400x300', 'laptop,oled,creative'),
    },
    {
      name: 'Ultrabook Stellar Air 14',
      brand: 'Stellar',
      description: 'Ultrabook 14" 1.1kg con Intel i7 1360P, 16GB RAM LPDDR5 y SSD 1TB PCIe 4.0.',
      color: 'Plata',
      price_cents: 899990,
      stock: 9,
      category: 'Ultrabooks',
      image_url: unsplash('800x600', 'ultrabook,desk'),
      thumb_url: unsplash('400x300', 'ultrabook,desk'),
    },
    {
      name: 'Ultrabook Polaris X13',
      brand: 'Polaris',
      description: 'Convertible 13" OLED 2.8K, Ryzen 7 7840U y autonomia de hasta 12 horas.',
      color: 'Azul acero',
      price_cents: 799990,
      stock: 12,
      category: 'Ultrabooks',
      image_url: unsplash('800x600', 'convertible,laptop'),
      thumb_url: unsplash('400x300', 'convertible,laptop'),
    },
    {
      name: 'GPU Falcon RTX 4070',
      brand: 'Falcon',
      description: 'Tarjeta grafica con 12GB GDDR6X, triple ventilador y soporte DLSS 3.',
      color: 'Negro',
      price_cents: 599990,
      stock: 5,
      category: 'Tarjetas Graficas',
      image_url: unsplash('800x600', 'gpu,graphicscard'),
      thumb_url: unsplash('400x300', 'gpu,graphicscard'),
    },
    {
      name: 'GPU Aurora RX 7800 XT',
      brand: 'Aurora',
      description: '16GB GDDR6, arquitectura RDNA 3 y backplate metalico para alta disipacion.',
      color: 'Negro y rojo',
      price_cents: 689990,
      stock: 4,
      category: 'Tarjetas Graficas',
      image_url: unsplash('800x600', 'gpu,pc,build'),
      thumb_url: unsplash('400x300', 'gpu,pc,build'),
    },
    {
      name: 'SSD NVMe Velocity 1TB Gen4',
      brand: 'Velocity',
      description: 'Unidad NVMe PCIe 4.0 con disipador de aluminio y velocidades 7000/6500 MBs.',
      color: 'Negro',
      price_cents: 139990,
      stock: 25,
      category: 'Almacenamiento',
      image_url: unsplash('800x600', 'ssd,nvme'),
      thumb_url: unsplash('400x300', 'ssd,nvme'),
    },
    {
      name: 'SSD Portatil Pulse 2TB USB-C',
      brand: 'Pulse',
      description: 'SSD portatil IP54, carcasa de aluminio y hasta 1050MBs por USB-C 3.2.',
      color: 'Gris',
      price_cents: 219990,
      stock: 14,
      category: 'Almacenamiento',
      image_url: unsplash('800x600', 'portable,ssd'),
      thumb_url: unsplash('400x300', 'portable,ssd'),
    },
    {
      name: 'Teclado Mecanico Wave TKL',
      brand: 'Wave',
      description: 'Layout TKL, switches hot-swap y teclas PBT doble inyeccion con RGB per key.',
      color: 'Blanco',
      price_cents: 69990,
      stock: 18,
      category: 'Perifericos',
      image_url: unsplash('800x600', 'mechanical,keyboard'),
      thumb_url: unsplash('400x300', 'mechanical,keyboard'),
    },
    {
      name: 'Mouse Glider Pro Wireless',
      brand: 'Glider',
      description: 'Sensor 26K DPI, autonomia 130h y peso 68g con conexion dual 2.4Ghz + BT.',
      color: 'Negro',
      price_cents: 49990,
      stock: 32,
      category: 'Perifericos',
      image_url: unsplash('800x600', 'wireless,mouse'),
      thumb_url: unsplash('400x300', 'wireless,mouse'),
    },
    {
      name: 'Auriculares Orion Surround 7.1',
      brand: 'Orion',
      description: 'Sonido envolvente 7.1, microfono retractil con cancelacion y almohadillas memory foam.',
      color: 'Azul',
      price_cents: 64990,
      stock: 22,
      category: 'Perifericos',
      image_url: unsplash('800x600', 'gaming,headset'),
      thumb_url: unsplash('400x300', 'gaming,headset'),
    },
    {
      name: 'Monitor Quantum 32 QHD 165Hz',
      brand: 'Quantum',
      description: 'Panel IPS 32" QHD 165Hz, 1ms y USB-C 90W para notebooks.',
      color: 'Negro',
      price_cents: 389990,
      stock: 9,
      category: 'Monitores',
      image_url: unsplash('800x600', 'monitor,desk'),
      thumb_url: unsplash('400x300', 'monitor,desk'),
    },
    {
      name: 'Kit Ventiladores RGB Aria',
      brand: 'Aria',
      description: 'Pack de 3 ventiladores 120mm ARGB con controlador y soporte software.',
      color: 'Blanco',
      price_cents: 54990,
      stock: 28,
      category: 'Refrigeracion',
      image_url: unsplash('800x600', 'pc,fan,rgb'),
      thumb_url: unsplash('400x300', 'pc,fan,rgb'),
    },
    {
      name: 'Refrigeracion Liquida Frost 360',
      brand: 'Frost',
      description: 'Radiador 360mm, bomba ceramica y tubos reforzados, incluye pasta termica premium.',
      color: 'Negro',
      price_cents: 189990,
      stock: 8,
      category: 'Refrigeracion',
      image_url: unsplash('800x600', 'liquid,cooling,pc'),
      thumb_url: unsplash('400x300', 'liquid,cooling,pc'),
    },
    {
      name: 'Router Mesh Atlas AXE7800',
      brand: 'Atlas',
      description: 'Sistema mesh tribanda WiFi 6E con seguridad WPA3 y puertos multi-gig.',
      color: 'Negro',
      price_cents: 329990,
      stock: 6,
      category: 'Networking',
      image_url: unsplash('800x600', 'wifi,router'),
      thumb_url: unsplash('400x300', 'wifi,router'),
    },
    {
      name: 'Switch Administrable Titan 24G',
      brand: 'Titan',
      description: 'Switch L2+ con 24 puertos gigabit, 4 SFP y gestion web/CLI.',
      color: 'Gris',
      price_cents: 259990,
      stock: 7,
      category: 'Networking',
      image_url: unsplash('800x600', 'network,switch'),
      thumb_url: unsplash('400x300', 'network,switch'),
    },
    {
      name: 'Fuente 850W 80 Plus Gold Titan',
      brand: 'Titan',
      description: 'Fuente modular 850W, cables sleeved y ventilador semi-pasivo.',
      color: 'Negro',
      price_cents: 149990,
      stock: 15,
      category: 'Tarjetas Graficas',
      image_url: unsplash('800x600', 'powersupply,pc'),
      thumb_url: unsplash('400x300', 'powersupply,pc'),
    },
  ]

  for (const item of products) {
    const categoryId = categoryMap.get(slugify(item.category)) ?? null
    await prisma.product.create({
      data: {
        name: item.name,
        brand: item.brand,
        description: item.description,
        color: item.color,
        price_cents: item.price_cents,
        stock: item.stock,
        is_active: true,
        categoryId,
        image_url: item.image_url,
        thumb_url: item.thumb_url,
      },
    })
  }
}

async function main() {
  await seedUsers()
  await seedCatalog()
  console.log('Seed completado')
}

main()
  .catch((error) => {
    console.error('Error en seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
