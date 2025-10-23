import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creando usuario de prueba seller...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@tienda.com' },
    update: { role: Role.SELLER },
    create: {
      name: 'Vendedor Demo',
      email: 'vendedor@tienda.com',
      password_hash: hashedPassword,
      role: Role.SELLER,
    },
  })

  console.log('Usuario listo:', seller.email)
  console.log('Credenciales de acceso:')
  console.log(' - Email: vendedor@tienda.com')
  console.log(' - Password: password123')
  console.log(' - Rol:', seller.role)
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
