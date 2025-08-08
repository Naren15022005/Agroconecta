import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoles() {
  console.log('🌱 Poblando roles...');

  const roles = [
    {
      id: 'AGRC_ROL_ADMIN',
      name: 'ADMINISTRADOR',
      displayName: 'Administrador',
      description: 'Administrador del sistema con acceso completo',
      isActive: true
    },
    {
      id: 'AGRC_ROL_AGRICULTOR',
      name: 'CAMPESINO',
      displayName: 'Campesino/Agricultor',
      description: 'Productor agrícola que vende productos',
      isActive: true
    },
    {
      id: 'AGRC_ROL_CLIENTE',
      name: 'COMPRADOR',
      displayName: 'Comprador',
      description: 'Comprador individual de productos agrícolas',
      isActive: true
    },
    {
      id: 'AGRC_ROL_EMPRESA',
      name: 'EMPRESA',
      displayName: 'Empresa',
      description: 'Empresa compradora de productos al por mayor',
      isActive: true
    }
  ];

  for (const role of roles) {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { id: role.id }
      });

      if (!existingRole) {
        await prisma.role.create({
          data: role
        });
        console.log(`✅ Rol creado: ${role.displayName}`);
      } else {
        console.log(`ℹ️  Rol ya existe: ${role.displayName}`);
      }
    } catch (error) {
      console.error(`❌ Error creando rol ${role.displayName}:`, error);
    }
  }

  console.log('✅ Roles poblados exitosamente\n');
}

async function seedCategoriesAndSubcategories() {
  console.log('🌱 Poblando categorías y subcategorías...');

  const categoriesData = [
    {
      id: 'AGRC_CAT_FRUTAS',
      name: 'Frutas',
      description: 'Productos frutales frescos',
      subcategories: [
        {
          id: 'AGRC_SUB_CITRICOS',
          name: 'Cítricos',
          description: 'Naranja, limón, mandarina, toronja, etc.'
        },
        {
          id: 'AGRC_SUB_EXOTICAS',
          name: 'Exóticas',
          description: 'Mango, maracuyá, guanábana, lulo, etc.'
        },
        {
          id: 'AGRC_SUB_TROPICALES',
          name: 'Tropicales',
          description: 'Banano, plátano, papaya, piña, etc.'
        }
      ]
    },
    {
      id: 'AGRC_CAT_VERDURAS',
      name: 'Verduras',
      description: 'Verduras y hortalizas frescas',
      subcategories: [
        {
          id: 'AGRC_SUB_HOJA_VERDE',
          name: 'Hortalizas de hoja',
          description: 'Lechuga, espinaca, acelga, apio, etc.'
        },
        {
          id: 'AGRC_SUB_FRUTO',
          name: 'Hortalizas de fruto',
          description: 'Tomate, pimentón, pepino, calabacín, etc.'
        }
      ]
    },
    {
      id: 'AGRC_CAT_TUBERCULOS',
      name: 'Tubérculos',
      description: 'Papa, yuca, ñame, arracacha, etc.',
      subcategories: [
        {
          id: 'AGRC_SUB_PAPA',
          name: 'Papa',
          description: 'Papa criolla, pastusa, sabanera, etc.'
        },
        {
          id: 'AGRC_SUB_YUCA',
          name: 'Yuca',
          description: 'Yuca blanca, amarilla, dulce, etc.'
        }
      ]
    },
    {
      id: 'AGRC_CAT_GRANOS',
      name: 'Granos',
      description: 'Arroz, frijol, lenteja, garbanzo, etc.',
      subcategories: [
        {
          id: 'AGRC_SUB_ARROZ',
          name: 'Arroz',
          description: 'Arroz integral, blanco, basmati, etc.'
        },
        {
          id: 'AGRC_SUB_FRIJOL',
          name: 'Frijol',
          description: 'Frijol rojo, negro, blanco, etc.'
        }
      ]
    },
    {
      id: 'AGRC_CAT_HIERBAS',
      name: 'Hierbas',
      description: 'Aromáticas, medicinales y culinarias',
      subcategories: [
        {
          id: 'AGRC_SUB_AROMATICAS',
          name: 'Hierbas aromáticas',
          description: 'Cilantro, perejil, albahaca, oregano, etc.'
        },
        {
          id: 'AGRC_SUB_MEDICINALES',
          name: 'Hierbas medicinales',
          description: 'Manzanilla, menta, hierba buena, etc.'
        }
      ]
    },
    {
      id: 'AGRC_CAT_FLORES',
      name: 'Flores',
      description: 'Flores, follajes y plantas ornamentales',
      subcategories: [
        {
          id: 'AGRC_SUB_ORNAMENTALES',
          name: 'Flores ornamentales',
          description: 'Rosas, lirios, claveles, etc.'
        },
        {
          id: 'AGRC_SUB_FOLLAJES',
          name: 'Follajes',
          description: 'Helechos, palmas, etc.'
        }
      ]
    }
  ];

  // Crear categorías y subcategorías
  for (const categoryData of categoriesData) {
    try {
      // Verificar si la categoría existe
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryData.id }
      });

      let category;
      if (!existingCategory) {
        category = await prisma.category.create({
          data: {
            id: categoryData.id,
            name: categoryData.name,
            description: categoryData.description,
            isActive: true
          }
        });
        console.log(`✅ Categoría creada: ${categoryData.name}`);
      } else {
        category = existingCategory;
        console.log(`ℹ️  Categoría ya existe: ${categoryData.name}`);
      }

      // Crear subcategorías
      for (const subData of categoryData.subcategories) {
        try {
          const existingSubcategory = await prisma.subcategory.findUnique({
            where: { id: subData.id }
          });

          if (!existingSubcategory) {
            await prisma.subcategory.create({
              data: {
                id: subData.id,
                name: subData.name,
                description: subData.description,
                isActive: true,
                categoryId: category.id
              }
            });
            console.log(`  ✅ Subcategoría creada: ${subData.name}`);
          } else {
            console.log(`  ℹ️  Subcategoría ya existe: ${subData.name}`);
          }
        } catch (error) {
          console.error(`  ❌ Error creando subcategoría ${subData.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`❌ Error creando categoría ${categoryData.name}:`, error);
    }
  }

  console.log('✅ Categorías y subcategorías pobladas exitosamente\n');
}

async function main() {
  console.log('🚀 Iniciando población de datos esenciales...\n');
  
  await seedRoles();
  await seedCategoriesAndSubcategories();
  
  console.log('🎉 ¡Población de datos completada exitosamente!');
}

main()
  .catch(e => {
    console.error('❌ Error durante la población:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
