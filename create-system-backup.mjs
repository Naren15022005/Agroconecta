import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function createSystemBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup_${timestamp}`;
  
  // Crear directorio de backup
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  console.log(`🔄 Creando backup del sistema en: ${backupDir}`);
  
  try {
    // 1. Backup de roles
    console.log('📋 Exportando roles...');
    const roles = await prisma.role.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'roles.json'),
      JSON.stringify(roles, null, 2)
    );
    
    // 2. Backup de categorías
    console.log('📂 Exportando categorías...');
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    });
    fs.writeFileSync(
      path.join(backupDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );
    
    // 3. Backup de subcategorías
    console.log('📑 Exportando subcategorías...');
    const subcategories = await prisma.subcategory.findMany();
    fs.writeFileSync(
      path.join(backupDir, 'subcategories.json'),
      JSON.stringify(subcategories, null, 2)
    );
    
    // 4. Backup de usuarios (sin contraseñas)
    console.log('👥 Exportando usuarios...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        correo: true,
        isActive: true,
        roleId: true,
        role: {
          select: {
            name: true,
            displayName: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });
    fs.writeFileSync(
      path.join(backupDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    
    // 5. Backup de productos (si existen)
    console.log('🌾 Exportando productos...');
    try {
      const products = await prisma.producto.findMany({
        include: {
          category: true,
          subcategory: true
        }
      });
      fs.writeFileSync(
        path.join(backupDir, 'products.json'),
        JSON.stringify(products, null, 2)
      );
    } catch (error) {
      console.log('ℹ️ No hay productos para exportar o tabla no existe');
    }
    
    // 6. Crear script de restauración
    console.log('📜 Creando script de restauración...');
    const restoreScript = `
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
`;
    
    fs.writeFileSync(
      path.join(backupDir, 'restore.mjs'),
      restoreScript
    );
    
    // 7. Crear información del backup
    const backupInfo = {
      createdAt: new Date().toISOString(),
      description: 'Backup completo del sistema AgroConecta',
      contents: {
        roles: roles.length,
        categories: categories.length,
        subcategories: subcategories.length,
        users: users.length
      },
      instructions: {
        restore: 'npx tsx restore.mjs',
        verify: 'npx tsx ../verify-data.ts'
      }
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-info.json'),
      JSON.stringify(backupInfo, null, 2)
    );
    
    console.log('✅ Backup completo creado exitosamente');
    console.log(`📁 Directorio: ${backupDir}`);
    console.log(`📊 Contenido:`);
    console.log(`   - Roles: ${roles.length}`);
    console.log(`   - Categorías: ${categories.length}`);
    console.log(`   - Subcategorías: ${subcategories.length}`);
    console.log(`   - Usuarios: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Error creando backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSystemBackup();
