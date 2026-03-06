import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeId(id) {
  if (!id || typeof id !== 'string') return id;
  if (id.startsWith('AGRC_USR_')) return id.replace('AGRC_USR_', 'AGRC_USER_');
  return id;
}

async function normalizeUsers() {
  console.log('Scanning users for AGRC_USR_ ids...');
  const users = await prisma.$queryRawUnsafe("SELECT id FROM users WHERE id LIKE 'AGRC_USR_%'");
  if (!users || users.length === 0) {
    console.log('No AGRC_USR_ ids found.');
    return;
  }

  console.log(`Found ${users.length} users to normalize.`);
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0');

  try {
    for (const u of users) {
      const oldId = u.id;
      const newId = normalizeId(oldId);
      if (oldId === newId) continue;
      console.log(`Normalizing user ${oldId} -> ${newId}`);

      // Update referencing tables
      const refs = [
        { table: 'accounts', column: 'userId' },
        { table: 'sessions', column: 'userId' },
        { table: 'clientes', column: 'user_id' },
        { table: 'empresas', column: 'user_id' },
        { table: 'agricultores', column: 'user_id' },
        { table: 'cart_items', column: 'userId' },
        { table: 'orders', column: 'buyerId' },
        { table: 'sales', column: 'compradorId' },
        { table: 'sales', column: 'vendedorId' },
        { table: 'pagos', column: 'userId' },
        { table: 'transacciones', column: 'userId' },
        { table: 'wallets', column: 'userId' },
        { table: 'withdraw_requests', column: 'userId' },
        { table: 'payment_transactions', column: 'compradorId' }
      ];

      for (const r of refs) {
        const { table, column } = r;
        // try parameterized first
        try {
          const q = `UPDATE ${table} SET ${column} = ? WHERE ${column} = ?`;
          await prisma.$executeRawUnsafe(prisma.$queryRaw`${q}`, newId, oldId);
        } catch (e) {
          // fallback
          await prisma.$executeRawUnsafe(`UPDATE ${table} SET ${column} = '${newId}' WHERE ${column} = '${oldId}'`);
        }
        console.log(`  - Updated ${table}.${column}`);
      }

      // finally update users.id
      await prisma.$executeRawUnsafe(`UPDATE users SET id = '${newId}' WHERE id = '${oldId}'`);
      console.log(`  - Updated users.id`);
    }
  } finally {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1');
  }
}

async function main(){
  console.log('Starting users normalization');
  await normalizeUsers();
  console.log('Users normalization complete');
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(async ()=>{await prisma.$disconnect();});
