import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarDatos() {
  console.log('🔍 Verificando datos en la base de datos...\n');

  try {
    // Verificar roles
    const roles = await prisma.role.findMany();
    console.log(`✅ Roles encontrados: ${roles.length}`);
    roles.forEach(role => {
      console.log(`   - ${role.displayName} (${role.name})`);
    });

    // Verificar categorías
    const categorias = await prisma.category.findMany();
    console.log(`\n✅ Categorías encontradas: ${categorias.length}`);
    categorias.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.description}`);
    });

    // Verificar subcategorías
    const subcategorias = await prisma.subcategory.findMany({
      include: {
        category: {
          select: { name: true }
        }
      }
    });
    console.log(`\n✅ Subcategorías encontradas: ${subcategorias.length}`);
    subcategorias.forEach(sub => {
      console.log(`   - ${sub.name} (${sub.category.name})`);
    });

    // Verificar usuarios
    const usuarios = await prisma.user.findMany({
      include: {
        role: {
          select: { displayName: true }
        }
      }
    });
    console.log(`\n✅ Usuarios encontrados: ${usuarios.length}`);
    usuarios.forEach(user => {
      console.log(`   - ${user.nombre} (${user.correo}) - ${user.role.displayName}`);
    });

    // Verificar estructura de pedidos
    const pedidosCount = await prisma.order.count();
    console.log(`\n✅ Pedidos en la base de datos: ${pedidosCount}`);

    console.log('\n🎉 ¡Verificación completada exitosamente!');
    console.log('\n📋 Resumen de datos poblados:');
    console.log(`   - ${roles.length} roles creados`);
    console.log(`   - ${categorias.length} categorías creadas`);
    console.log(`   - ${subcategorias.length} subcategorías creadas`);
    console.log(`   - ${usuarios.length} usuario(s) creado(s)`);
    console.log('\n🚀 El sistema está listo para usar!');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

verificarDatos()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
