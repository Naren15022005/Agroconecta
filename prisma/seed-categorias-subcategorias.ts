import { PrismaClient } from '@prisma/client';
import AgroConectaIdGenerator from '../src/lib/id-generator';
// import AgroConectaIdGenerator from '../src/lib/id-generator';

const prisma = new PrismaClient();

async function main() {

  // Roles
  const roles = [
    {
      id: 'AGRC_ROL_ADMIN',
      name: 'admin',
      displayName: 'Administrador',
      description: 'Gestión total del sistema',
      isActive: true,
    },
    {
      id: 'AGRC_ROL_AGRICULTOR',
      name: 'agricultor',
      displayName: 'Campesino/Agricultor',
      description: 'Publica y gestiona productos',
      isActive: true,
    },
    {
      id: 'AGRC_ROL_CLIENTE',
      name: 'cliente',
      displayName: 'Comprador',
      description: 'Compra productos agrícolas',
      isActive: true,
    },
    {
      id: 'AGRC_ROL_EMPRESA',
      name: 'empresa',
      displayName: 'Empresa',
      description: 'Compra productos al por mayor',
      isActive: true,
    },
  ];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  // Categorías
  const categorias = [
    { name: 'Frutas', description: 'Productos frutales frescos' },
    { name: 'Verduras', description: 'Verduras y hortalizas' },
    { name: 'Tubérculos', description: 'Papa, yuca, ñame, arracacha, etc.' },
    { name: 'Granos', description: 'Arroz, frijol, lenteja, garbanzo, etc.' },
    { name: 'Hierbas', description: 'Aromáticas, medicinales y culinarias' },
    { name: 'Flores', description: 'Flores, follajes y ornamentales' },
  ];
  const categoriaIds: Record<string, string> = {};

  // Seed categories (idempotent)
  for (const cat of categorias) {
    const id = AgroConectaIdGenerator.generateCategoryId();
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        id,
        name: cat.name,
        description: cat.description,
        isActive: true,
      },
    });
    categoriaIds[cat.name] = category.id;
  }

  // Subcategorías
  const subcategorias = [
    { name: 'Banano', description: 'Fruta tropical', categoria: 'Frutas' },
    { name: 'Mango', description: 'Fruta dulce', categoria: 'Frutas' },
    { name: 'Papa', description: 'Tubérculo andino', categoria: 'Tubérculos' },
    { name: 'Yuca', description: 'Tubérculo tropical', categoria: 'Tubérculos' },
    { name: 'Cilantro', description: 'Hierba aromática', categoria: 'Hierbas' },
    { name: 'Rosa', description: 'Flor ornamental', categoria: 'Flores' },
  ];

  for (const sub of subcategorias) {
    const id = AgroConectaIdGenerator.generateSubcategoryId();
    await prisma.subcategory.upsert({
      where: { name: sub.name },
      update: {},
      create: {
        id,
        name: sub.name,
        description: sub.description,
        isActive: true,
        categoryId: categoriaIds[sub.categoria],
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
