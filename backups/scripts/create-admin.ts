import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👤 Creando usuario administrador...');

  const adminEmail = 'admin@agroconecta.com';
  const adminPassword = 'admin123'; // Cambiar en producción
  
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findUnique({
      where: { correo: adminEmail }
    });

    if (existingAdmin) {
      console.log('ℹ️  Usuario administrador ya existe');
      return;
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Crear el usuario administrador
    const adminUser = await prisma.user.create({
      data: {
        id: 'AGRC_USR_ADMIN',
        nombre: 'Administrador Sistema',
        correo: adminEmail,
        contraseña: hashedPassword,
        roleId: 'AGRC_ROL_ADMIN',
        isActive: true
      }
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Contraseña: ${adminPassword}`);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  }
}

createAdminUser()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
