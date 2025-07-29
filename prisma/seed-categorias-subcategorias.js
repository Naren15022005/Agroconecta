const { PrismaClient } = require('@prisma/client');
const { AgroConectaIdGenerator } = require('../src/lib/id-generator');

const prisma = new PrismaClient();

async function main() {
  // Categorías
  const categorias = [
    { name: 'Frutas', description: 'Productos frutales frescos' },
    { name: 'Verduras', description: 'Verduras y hortalizas' },
    { name: 'Tubérculos', description: 'Papa, yuca, ñame, arracacha, etc.' },
    { name: 'Granos', description: 'Arroz, frijol, lenteja, garbanzo, etc.' },
    { name: 'Hierbas', description: 'Aromáticas, medicinales y culinarias' },
    { name: 'Flores', description: 'Flores, follajes y ornamentales' },
  ];

  const categoriaIds = {};

  for (const cat of categorias) {
    const id = AgroConectaIdGenerator.generateCategoryId();
    await prisma.category.create({
      data: {
        id,
        name: cat.name,
        description: cat.description,
        isActive: true,
      },
    });
    categoriaIds[cat.name] = id;
  }

  // Subcategorías
  const subcategorias = [
    { name: 'Cítricos', description: 'Naranja, limón, mandarina, etc.', categoria: 'Frutas' },
    { name: 'Exóticas', description: 'Mango, maracuyá, guanábana, etc.', categoria: 'Frutas' },
    { name: 'Hortalizas de hoja', description: 'Lechuga, espinaca, acelga, etc.', categoria: 'Verduras' },
    { name: 'Hortalizas de fruto', description: 'Tomate, pimentón, pepino, etc.', categoria: 'Verduras' },
    { name: 'Papa', description: 'Papa criolla, pastusa, sabanera, etc.', categoria: 'Tubérculos' },
    { name: 'Yuca', description: 'Yuca blanca, amarilla, etc.', categoria: 'Tubérculos' },
    { name: 'Arroz', description: 'Arroz integral, blanco, etc.', categoria: 'Granos' },
    { name: 'Frijol', description: 'Frijol rojo, negro, etc.', categoria: 'Granos' },
    { name: 'Hierbas aromáticas', description: 'Cilantro, perejil, albahaca, etc.', categoria: 'Hierbas' },
    { name: 'Hierbas medicinales', description: 'Manzanilla, menta, etc.', categoria: 'Hierbas' },
    { name: 'Flores ornamentales', description: 'Rosas, lirios, etc.', categoria: 'Flores' },
    { name: 'Follajes', description: 'Helechos, etc.', categoria: 'Flores' },
  ];

  for (const sub of subcategorias) {
    const id = AgroConectaIdGenerator.generateId('SUB');
    await prisma.subcategory.create({
      data: {
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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
