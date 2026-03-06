import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function canonicalizeType(raw) {
  const t = String(raw).toUpperCase();
  const map = {
    USR: 'USER',
    AGR: 'USER_AGRICULTOR',
    CLI: 'USER_CLIENTE',
    EMP: 'USER_EMPRESA',
    PRD: 'PRD',
    ORD: 'ORD',
    CAT: 'CAT',
    ROL: 'ROL',
    SUB: 'SUB',
  };
  if (t.startsWith('USER_') || t === 'USER') return t;
  return map[t] ?? t;
}

function normalizeId(id) {
  if (!id || typeof id !== 'string') return id;
  const m = id.match(/^AGRC_([A-Z0-9_]+)_(.+)$/);
  if (!m) return id;
  const raw = m[1];
  const suffix = m[2];
  const canonical = canonicalizeType(raw);
  return `AGRC_${canonical}_${suffix}`;
}

async function normalizeTableIds(tableName, idColumn, relatedUpdates = []) {
  console.log(`Checking ${tableName}.${idColumn} for legacy IDs...`);
  const rows = await prisma.$queryRawUnsafe(`SELECT ${idColumn} as id FROM ${tableName} WHERE ${idColumn} LIKE 'AGRC_%' AND ${idColumn} NOT LIKE 'AGRC_USER_%'`);
  if (!rows || rows.length === 0) {
    console.log(`No legacy IDs found in ${tableName}.`);
    return;
  }

  console.log(`Found ${rows.length} legacy ids in ${tableName}. Running updates...`);

  // Temporarily disable FK checks
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0');
  try {
    for (const r of rows) {
      const oldId = r.id;
      const newId = normalizeId(oldId);
      if (oldId === newId) continue;

      console.log(`Normalizing ${tableName}: ${oldId} -> ${newId}`);

      // Update related tables' foreign keys first
      for (const upd of relatedUpdates) {
        const { table, column } = upd;
        const q = `UPDATE ${table} SET ${column} = ? WHERE ${column} = ?`;
        await prisma.$executeRawUnsafe(prisma.$queryRaw`${q}`, newId, oldId).catch(async (e) => {
          // fallback to unsafe execute if parameterization fails
          await prisma.$executeRawUnsafe(`UPDATE ${table} SET ${column} = '${newId}' WHERE ${column} = '${oldId}'`);
        });
        console.log(`  - Updated ${table}.${column}`);
      }

      // Update the id in the main table
      await prisma.$executeRawUnsafe(`UPDATE ${tableName} SET ${idColumn} = '${newId}' WHERE ${idColumn} = '${oldId}'`);
      console.log(`  - Updated ${tableName}.${idColumn}`);
    }
  } finally {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1');
  }
}

async function main() {
  console.log('Starting normalization of legacy IDs.');

  // Agricultores: referenced by products, payment_transactions, payment_orders, liquidaciones
  await normalizeTableIds('agricultores', 'id', [
    { table: 'products', column: 'agricultorId' },
    { table: 'payment_transactions', column: 'agricultorId' },
    { table: 'payment_orders', column: 'agricultor_id' },
    { table: 'liquidaciones', column: 'agricultor_id' },
  ]);

  // Clientes: rarely referenced directly, but normalize anyway
  await normalizeTableIds('clientes', 'id', []);

  // Empresas: normalize
  await normalizeTableIds('empresas', 'id', []);

  console.log('Normalization complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
