// Limpia cualquier campo 'role' y 'roleId' de un objeto (nivel superficial y profundo)
function cleanUserData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanUserData);
  } else if (obj && typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      if (key === 'role' || key === 'roleId') continue;
      cleaned[key] = cleanUserData(obj[key]);
    }
    return cleaned;
  }
  return obj;
}
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
        await prisma.role.upsert({ where: { id: role.id }, update: role, create: role });
      }
      console.log(`✅ ${roles.length} roles restaurados`);
    }
    // Restaurar categorías
    if (backupData.categories || backupData.data?.categories) {
      const categories = backupData.categories || backupData.data.categories;
      console.log('📂 Restaurando categorías...');
      for (const category of categories) {
        await prisma.category.upsert({ where: { id: category.id }, update: category, create: category });
      }
      console.log(`✅ ${categories.length} categorías restauradas`);
    }
    // Restaurar subcategorías
    if (backupData.subcategories || backupData.data?.subcategories) {
      const subcategories = backupData.subcategories || backupData.data.subcategories;
      console.log('📁 Restaurando subcategorías...');
      for (const subcategory of subcategories) {
        await prisma.subcategory.upsert({ where: { id: subcategory.id }, update: subcategory, create: subcategory });
      }
      console.log(`✅ ${subcategories.length} subcategorías restauradas`);
    }
    // Restaurar usuarios completos si existen
    // 1. Restaurar roles
    if (backupData.roles || backupData.data?.roles) {
      const roles = backupData.roles || backupData.data.roles;
      console.log('📋 Restaurando roles...');
      for (const role of roles) {
        await prisma.role.upsert({ where: { id: role.id }, update: role, create: role });
      }
      console.log(`✅ ${roles.length} roles restaurados`);
    }
    // 2. Restaurar categorías
    if (backupData.categories || backupData.data?.categories) {
      const categories = backupData.categories || backupData.data.categories;
      console.log('📂 Restaurando categorías...');
      for (const category of categories) {
        await prisma.category.upsert({ where: { id: category.id }, update: category, create: category });
      }
      console.log(`✅ ${categories.length} categorías restauradas`);
    }
    // 3. Restaurar subcategorías
    if (backupData.subcategories || backupData.data?.subcategories) {
      const subcategories = backupData.subcategories || backupData.data.subcategories;
      console.log('📁 Restaurando subcategorías...');
      for (const subcategory of subcategories) {
        await prisma.subcategory.upsert({ where: { id: subcategory.id }, update: subcategory, create: subcategory });
      }
      console.log(`✅ ${subcategories.length} subcategorías restauradas`);
    }
    // 4. Restaurar usuarios completos si existen
    if (backupData.data?.users) {
      console.log('� Restaurando usuarios...');
      let usuariosRestaurados = 0;
      let usuariosOmitidos = 0;
      for (const user of backupData.data.users) {
        // Solo tomar los campos válidos del modelo User
        const {
          id,
          nombre,
          correo,
          contraseña,
          isActive,
          createdAt,
          updatedAt,
          roleId
        } = user;
        if (!roleId) {
          console.warn(`⚠️  Usuario omitido por no tener roleId: ${correo}`);
          usuariosOmitidos++;
          continue;
        }
        const userData = {
          id,
          nombre,
          correo,
          contraseña,
          isActive,
          createdAt,
          updatedAt
        };
        let passwordToUse = userData.contraseña;
        if (userData.contraseña === '[ENCRYPTED]') {
          passwordToUse = 'cambiar123'; // contraseña temporal
          console.warn(`⚠️  Usuario ${userData.correo} restaurado con contraseña temporal 'cambiar123'`);
        }
        try {
          await prisma.user.upsert({
            where: { correo: user.correo },
            update: { ...userData, contraseña: passwordToUse },
            create: { ...userData, contraseña: passwordToUse, role: { connect: { id: roleId } } }
          });
          usuariosRestaurados++;
        } catch (e) {
          const msg = (e as any)?.message || e;
          console.warn(`⚠️  Usuario omitido por error: ${userData.correo} (${msg})`);
          usuariosOmitidos++;
        }
      }
      console.log(`✅ ${usuariosRestaurados} usuarios restaurados`);
      if (usuariosOmitidos > 0) {
        console.warn(`⚠️  ${usuariosOmitidos} usuarios omitidos por error`);
      }
    }
    // 5. Restaurar productos (requiere usuarios y subcategorías existentes)
    if (backupData.data?.products) {
      console.log('🥕 Restaurando productos...');
      // Obtener IDs de usuarios existentes
      const existingUsers = await prisma.user.findMany({ select: { id: true } });
      const userIds = new Set(existingUsers.map(u => u.id));
      let productosRestaurados = 0;
      let productosOmitidos = 0;
      for (const product of backupData.data.products) {
        if (!userIds.has(product.agricultorId)) {
          console.warn(`⚠️  Producto omitido (agricultorId no existe): ${product.id} - ${product.name}`);
          productosOmitidos++;
          continue;
        }
        const { category, subcategory, ...productData } = product;
        await prisma.product.upsert({ where: { id: product.id }, update: productData, create: productData });
        productosRestaurados++;
      }
      console.log(`✅ ${productosRestaurados} productos restaurados`);
      if (productosOmitidos > 0) {
        console.warn(`⚠️  ${productosOmitidos} productos omitidos por agricultorId inexistente`);
      }
    }
    if (backupData.data?.verificationTokens) {
      console.log('� Restaurando verificationTokens...');
      for (const vt of backupData.data.verificationTokens) {
        await prisma.verificationToken.upsert({ where: { id: vt.id }, update: vt, create: vt });
      }
      console.log(`✅ ${backupData.data.verificationTokens.length} verificationTokens restaurados`);
    }
    // Restaurar sessions
    if (backupData.data?.sessions) {
      console.log('🗝️ Restaurando sessions...');
      for (const s of backupData.data.sessions) {
        await prisma.session.upsert({ where: { id: s.id }, update: s, create: s });
      }
      console.log(`✅ ${backupData.data.sessions.length} sessions restaurados`);
    }
    // Restaurar wallets
    if (backupData.data?.wallets) {
      console.log('💰 Restaurando wallets...');
      for (const w of backupData.data.wallets) {
        await prisma.wallet.upsert({ where: { id: w.id }, update: w, create: w });
      }
      console.log(`✅ ${backupData.data.wallets.length} wallets restaurados`);
    }
    // Restaurar walletTransactions
    if (backupData.data?.walletTransactions) {
      console.log('💳 Restaurando walletTransactions...');
      for (const wt of backupData.data.walletTransactions) {
        await prisma.walletTransaction.upsert({ where: { id: wt.id }, update: wt, create: wt });
      }
      console.log(`✅ ${backupData.data.walletTransactions.length} walletTransactions restaurados`);
    }
    // Restaurar sales
    if (backupData.data?.sales) {
      console.log('🧾 Restaurando sales...');
      for (const sale of backupData.data.sales) {
        await prisma.sale.upsert({ where: { id: sale.id }, update: sale, create: sale });
      }
      console.log(`✅ ${backupData.data.sales.length} sales restaurados`);
    }
    // Restaurar comisiones
    if (backupData.data?.comisiones) {
      console.log('💸 Restaurando comisiones...');
      for (const c of backupData.data.comisiones) {
        await prisma.comision.upsert({ where: { id: c.id }, update: c, create: c });
      }
      console.log(`✅ ${backupData.data.comisiones.length} comisiones restauradas`);
    }
    // Restaurar impuestos
    if (backupData.data?.impuestos) {
      console.log('💰 Restaurando impuestos...');
      for (const imp of backupData.data.impuestos) {
        await prisma.impuesto.upsert({ where: { id: imp.id }, update: imp, create: imp });
      }
      console.log(`✅ ${backupData.data.impuestos.length} impuestos restaurados`);
    }
    // Restaurar withdrawRequests
    if (backupData.data?.withdrawRequests) {
      console.log('🏦 Restaurando withdrawRequests...');
      for (const wr of backupData.data.withdrawRequests) {
        await prisma.withdrawRequest.upsert({ where: { id: wr.id }, update: wr, create: wr });
      }
      console.log(`✅ ${backupData.data.withdrawRequests.length} withdrawRequests restaurados`);
    }
    // Restaurar pagos
    if (backupData.data?.pagos) {
      console.log('💵 Restaurando pagos...');
      for (const p of backupData.data.pagos) {
        await prisma.pago.upsert({ where: { id: p.id }, update: p, create: p });
      }
      console.log(`✅ ${backupData.data.pagos.length} pagos restaurados`);
    }
    // Restaurar transacciones
    if (backupData.data?.transacciones) {
      console.log('🔄 Restaurando transacciones...');
      for (const t of backupData.data.transacciones) {
        await prisma.transaccion.upsert({ where: { id: t.id }, update: t, create: t });
      }
      console.log(`✅ ${backupData.data.transacciones.length} transacciones restauradas`);
    }
    // Restaurar notificaciones
    if (backupData.data?.notifications) {
      console.log('🔔 Restaurando notificaciones...');
      for (const n of backupData.data.notifications) {
        await prisma.notification.upsert({ where: { id: n.id }, update: n, create: n });
      }
      console.log(`✅ ${backupData.data.notifications.length} notificaciones restauradas`);
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
