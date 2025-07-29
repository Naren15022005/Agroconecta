const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Poblar roles
  await prisma.role.upsert({
    where: { name: 'agricultor' },
    update: {},
    create: { id: '1', name: 'agricultor', displayName: 'Campesino/Agricultor' },
  });
  await prisma.role.upsert({
    where: { name: 'cliente' },
    update: {},
    create: { id: '2', name: 'cliente', displayName: 'Cliente Individual' },
  });
  await prisma.role.upsert({
    where: { name: 'empresa' },
    update: {},
    create: { id: '3', name: 'empresa', displayName: 'Empresa' },
  });
  await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { id: '4', name: 'admin', displayName: 'Administrador' },
  });

  // Ejecutar seed de categorías y subcategorías si existe
  try {
    const seedCategorias = require('./seed-categorias-subcategorias');
    if (typeof seedCategorias === 'function') {
      await seedCategorias();
    } else if (seedCategorias && typeof seedCategorias.default === 'function') {
      await seedCategorias.default();
    }
    console.log('Seed de categorías ejecutado.');
  } catch (e) {
    if (e instanceof Error) {
      console.log('No se pudo ejecutar el seed de categorías:', e.message);
    } else {
      console.log('No se pudo ejecutar el seed de categorías:', e);
    }
  }

  console.log('Seed de roles completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
