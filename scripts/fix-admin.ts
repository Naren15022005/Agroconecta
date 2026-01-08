import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdmin() {
  const adminEmail = 'admin@agroconecta.com';
  const newPassword = 'admin123';

  try {
    const admin = await prisma.user.findUnique({
      where: { correo: adminEmail },
      include: { role: true }
    });

    if (!admin) {
      console.error('❌ Admin no encontrado');
      return;
    }

    console.log('Admin actual:');
    console.log({
      id: admin.id,
      nombre: admin.nombre,
      correo: admin.correo,
      isActive: admin.isActive,
      roleId: admin.roleId,
      role: admin.role?.name
    });

    // Activar y resetear contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { correo: adminEmail },
      data: {
        isActive: true,
        contraseña: hashedPassword
      }
    });

    console.log('\n✅ Admin actualizado:');
    console.log('  Email:', adminEmail);
    console.log('  Password:', newPassword);
    console.log('  isActive: true');
    console.log('\nPuedes iniciar sesión ahora en http://localhost:3000/auth/signin');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();
