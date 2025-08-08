import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function restoreFromBackup(backupFilename: string) {
  console.log(`🔄 Restaurando desde backup: ${backupFilename}\n`);

  const backupPath = path.join(process.cwd(), 'backups', backupFilename);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Archivo de backup no encontrado: ${backupPath}`);
    return;
  }

  try {
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log(`📅 Backup del: ${backupData.timestamp}`);
    console.log(`📝 Descripción: ${backupData.description}\n`);

    // Restaurar roles
    if (backupData.roles || backupData.data?.roles) {
      const roles = backupData.roles || backupData.data.roles;
      console.log('📋 Restaurando roles...');
      
      for (const role of roles) {
        await prisma.role.upsert({
          where: { id: role.id },
          update: role,
          create: role
        });
      }
      console.log(`✅ ${roles.length} roles restaurados`);
    }

    // Restaurar categorías
    if (backupData.categories || backupData.data?.categories) {
      const categories = backupData.categories || backupData.data.categories;
      console.log('📂 Restaurando categorías...');
      
      for (const category of categories) {
        await prisma.category.upsert({
          where: { id: category.id },
          update: category,
          create: category
        });
      }
      console.log(`✅ ${categories.length} categorías restauradas`);
    }

    // Restaurar subcategorías
    if (backupData.subcategories || backupData.data?.subcategories) {
      const subcategories = backupData.subcategories || backupData.data.subcategories;
      console.log('📁 Restaurando subcategorías...');
      
      for (const subcategory of subcategories) {
        await prisma.subcategory.upsert({
          where: { id: subcategory.id },
          update: subcategory,
          create: subcategory
        });
      }
      console.log(`✅ ${subcategories.length} subcategorías restauradas`);
    }

    // Restaurar usuario admin
    if (backupData.adminUser) {
      console.log('👤 Restaurando usuario administrador...');
      
      const adminUser = backupData.adminUser;
      // Generar nueva contraseña hash
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.upsert({
        where: { correo: adminUser.correo },
        update: {
          ...adminUser,
          contraseña: hashedPassword
        },
        create: {
          ...adminUser,
          contraseña: hashedPassword
        }
      });
      console.log(`✅ Usuario admin restaurado (email: ${adminUser.correo})`);
    }

    // Restaurar usuarios completos si existen
    if (backupData.data?.users) {
      console.log('👥 Restaurando usuarios...');
      
      for (const user of backupData.data.users) {
        if (user.contraseña === '[ENCRYPTED]') {
          continue; // Saltar usuarios sin contraseña
        }
        
        await prisma.user.upsert({
          where: { correo: user.correo },
          update: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            isActive: user.isActive,
            roleId: user.roleId
          },
          create: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            contraseña: user.contraseña,
            isActive: user.isActive,
            roleId: user.roleId
          }
        });
      }
      console.log(`✅ Usuarios restaurados`);
    }

    console.log('\n🎉 Restauración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la restauración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usar el archivo de backup si se proporciona como argumento
const backupFile = process.argv[2];
if (backupFile) {
  restoreFromBackup(backupFile);
} else {
  console.log('Uso: npx tsx restore-backup.ts <nombre-archivo-backup>');
  console.log('Ejemplo: npx tsx restore-backup.ts backup_esencial_2025-08-08_170657.json');
}
