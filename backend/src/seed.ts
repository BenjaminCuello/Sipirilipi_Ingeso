import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando usuario de prueba...');

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Crear o actualizar usuario vendedor
  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@tienda.com' },
    update: {},
    create: {
      email: 'vendedor@tienda.com',
      passwordHash: hashedPassword,
      role: 'SELLER'
    }
  });

  console.log('✅ Usuario creado:', seller);
  console.log('\n📋 Credenciales de acceso:');
  console.log('   Email: vendedor@tienda.com');
  console.log('   Contraseña: password123');
  console.log('   Rol:', seller.role);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
