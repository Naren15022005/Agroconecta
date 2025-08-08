
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restoreFromBackup() {
  console.log('🔄 Restaurando desde backup...');
  
  try {
    // Restaurar roles
    const roles = JSON.parse(fs.readFileSync('roles.json', 'utf8'));
    for (const role of roles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: role,
        create: role
      });
    }
    console.log('✅ Roles restaurados');
    
    // Restaurar categorías
    const categories = JSON.parse(fs.readFileSync('categories.json', 'utf8'));
    for (const category of categories) {
      const { subcategories, ...categoryData } = category;
      await prisma.category.upsert({
        where: { id: category.id },
        update: categoryData,
        create: categoryData
      });
    }
    console.log('✅ Categorías restauradas');
    
    // Restaurar subcategorías
    const subcategories = JSON.parse(fs.readFileSync('subcategories.json', 'utf8'));
    for (const subcategory of subcategories) {
      await prisma.subcategory.upsert({
        where: { id: subcategory.id },
        update: subcategory,
        create: subcategory
      });
    }
    console.log('✅ Subcategorías restauradas');
    
    console.log('🎉 Restauración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la restauración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreFromBackup();
