import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const outDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `normalized-ids-${new Date().toISOString().slice(0,10)}.csv`);

const tables = [
  { table: 'users', column: 'id' },
  { table: 'agricultores', column: 'id' },
  { table: 'clientes', column: 'id' },
  { table: 'empresas', column: 'id' },
  { table: 'products', column: 'agricultorId' },
  { table: 'accounts', column: 'userId' },
  { table: 'sessions', column: 'userId' },
  { table: 'cart_items', column: 'userId' },
  { table: 'orders', column: 'buyerId' },
  { table: 'sales', column: 'compradorId' },
  { table: 'sales', column: 'vendedorId' },
  { table: 'pagos', column: 'userId' },
  { table: 'transacciones', column: 'userId' },
  { table: 'wallets', column: 'userId' },
  { table: 'withdraw_requests', column: 'userId' },
  { table: 'payment_transactions', column: 'compradorId' },
  { table: 'payment_transactions', column: 'agricultorId' },
  { table: 'payment_orders', column: 'agricultor_id' },
  { table: 'liquidaciones', column: 'agricultor_id' },
];

async function scan(){
  const rowsOut = [];
  for(const t of tables){
    const { table, column } = t;
    try {
      const found = await prisma.$queryRawUnsafe(`SELECT ${column} as id FROM ${table} WHERE ${column} LIKE 'AGRC_%'`);
      for(const r of found){
        const id = r.id;
        const isLegacy = (id && id.startsWith('AGRC_') && !id.startsWith('AGRC_USER_')) ? 1 : 0;
        rowsOut.push(`${table},${column},${id},${isLegacy}`);
      }
    } catch (e) {
      // table/column might not exist in some setups
      console.warn(`Skipping ${table}.${column}: ${e.message}`);
    }
  }
  fs.writeFileSync(outFile, 'table,column,id,isLegacy\n' + rowsOut.join('\n'));
  return { outFile, count: rowsOut.length };
}

async function main(){
  console.log('Generating normalization report...');
  const res = await scan();
  console.log('Report written to', res.outFile);
  const sample = fs.readFileSync(res.outFile, 'utf8').split('\n').slice(0,30).join('\n');
  console.log('\nSample output:\n');
  console.log(sample);
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(async ()=>{await prisma.$disconnect();});
