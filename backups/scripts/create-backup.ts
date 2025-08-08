import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                   new Date().toTimeString().split(' ')[0].replace(/:/g, '');
  
  console.log('🔄 Creando backup completo de la base de datos...\n');

  const backup: any = {
    timestamp: new Date().toISOString(),
    description: 'Backup completo - roles, categorías, subcategorías y usuario admin funcionando',
    data: {
      roles: [],
      categories: [],
      subcategories: [],
      users: [],
      products: [],
      orders: []
    }
  };

  try {
    // Backup de roles
    console.log('📋 Respaldando roles...');
    backup.data.roles = await prisma.role.findMany();
    console.log(`✅ ${backup.data.roles.length} roles respaldados`);

    // Backup de categorías
    console.log('📂 Respaldando categorías...');
    backup.data.categories = await prisma.category.findMany();
    console.log(`✅ ${backup.data.categories.length} categorías respaldadas`);

    // Backup de subcategorías
    console.log('📁 Respaldando subcategorías...');
    backup.data.subcategories = await prisma.subcategory.findMany();
    console.log(`✅ ${backup.data.subcategories.length} subcategorías respaldadas`);

    // Backup de usuarios (sin contraseñas por seguridad)
    console.log('👥 Respaldando usuarios...');
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    });
    backup.data.users = users.map(user => ({
      ...user,
      contraseña: '[ENCRYPTED]' // No incluir contraseñas en el backup
    }));
    console.log(`✅ ${backup.data.users.length} usuarios respaldados`);

    // Backup de productos
    console.log('🥕 Respaldando productos...');
    backup.data.products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true
      }
    });
    console.log(`✅ ${backup.data.products.length} productos respaldados`);

    // Backup de pedidos
    console.log('📦 Respaldando pedidos...');
    backup.data.orders = await prisma.order.findMany({
      include: {
        items: true
      }
    });
    console.log(`✅ ${backup.data.orders.length} pedidos respaldados`);

    // Guardar backup
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup_completo_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    
    console.log(`\n🎉 Backup completo creado exitosamente:`);
    console.log(`📁 Archivo: ${filepath}`);
    console.log(`📊 Tamaño: ${fs.statSync(filepath).size} bytes`);
    
    // Crear también un backup solo de datos esenciales (para restauración rápida)
    const essentialBackup: any = {
      timestamp: backup.timestamp,
      description: 'Backup esencial - solo roles, categorías y admin',
      roles: backup.data.roles,
      categories: backup.data.categories,
      subcategories: backup.data.subcategories,
      adminUser: backup.data.users.find((u: any) => u.role.name === 'ADMINISTRADOR')
    };

    const essentialFilename = `backup_esencial_${timestamp}.json`;
    const essentialFilepath = path.join(backupDir, essentialFilename);
    fs.writeFileSync(essentialFilepath, JSON.stringify(essentialBackup, null, 2));
    
    console.log(`\n💎 Backup esencial creado:`);
    console.log(`📁 Archivo: ${essentialFilepath}`);

  } catch (error) {
    console.error('❌ Error creando backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBackup();
