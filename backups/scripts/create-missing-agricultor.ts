import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAgricultor() {
  const agricultorId = 'AGRC_AGR_ME3D3T30Y1G2';
  const userId = 'AGRC_USR_ME3D3T27K7NU';

  try {
    // Verificar que el user exista
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error(`Usuario no encontrado: ${userId}. Crea primero el usuario.`);
      return;
    }

    const agr = await prisma.agricultor.upsert({
      where: { id: agricultorId },
      update: {
        user_id: userId,
        verificado: false,
      },
      create: {
        id: agricultorId,
        user_id: userId,
        verificado: false,
      },
    });

    console.log('✅ Agricultor creado/actualizado:', agr.id);
  } catch (e) {
    console.error('❌ Error creando agricultor:', (e as any)?.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

createAgricultor();
