import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = 'admin@agroconecta.com';
  const adminPassword = 'Admin123!';

  const existing = await prisma.user.findUnique({
    where: { correo: adminEmail },
  });

  if (existing) {
    console.log('ℹ️  Admin already exists:');
    console.log('   Email:', adminEmail);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      id: `AGRC_USER_ADMIN_${Date.now().toString(36)}`,
      nombre: 'Administrador',
      correo: adminEmail,
      contraseña: hashedPassword,
      roleId: 'AGRC_ROL_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:');
  console.log('   Email:', adminEmail);
  console.log('   Password:', adminPassword);
}

seedAdmin()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
