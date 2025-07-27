import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const userId = 'AGRC_USR_MDJ9T9B9JXM3';
  
  console.log(`Buscando usuario: ${userId}`);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true
    }
  });
  
  if (user) {
    console.log('✅ Usuario encontrado:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Nombre: ${user.nombre}`);
    console.log(`- Correo: ${user.correo}`);
    console.log(`- Rol: ${user.role.name}`);
    console.log(`- Activo: ${user.isActive}`);
  } else {
    console.log('❌ Usuario NO encontrado');
  }
  
  // Verificar agricultor
  const agricultor = await prisma.agricultor.findUnique({
    where: { user_id: userId }
  });
  
  if (agricultor) {
    console.log('✅ Agricultor encontrado:');
    console.log(`- ID: ${agricultor.id}`);
    console.log(`- Verificado: ${agricultor.verificado}`);
  } else {
    console.log('❌ Agricultor NO encontrado');
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
